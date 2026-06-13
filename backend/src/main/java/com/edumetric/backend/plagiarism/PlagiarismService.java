package com.edumetric.backend.plagiarism;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.grades.AssignmentRepository;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.plagiarism.domain.PlagiarismReport;
import com.edumetric.backend.plagiarism.dto.CheckPlagiarismRequest;
import com.edumetric.backend.plagiarism.dto.PlagiarismReportDto;
import com.edumetric.backend.plagiarism.dto.SubmissionText;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Plagiarism / similarity-check hook. A teacher submits a batch of text submissions for an
 * assignment; this service computes pairwise textual similarity and persists every unordered pair
 * scoring at or above {@link #FLAG_THRESHOLD}.
 *
 * <p>Similarity algorithm (self-contained, no external dependencies): each text is normalized
 * (lowercased, punctuation stripped, whitespace collapsed), split into words, and reduced to a set
 * of word 3-shingles (every run of 3 consecutive words). Two submissions are scored by the Jaccard
 * index of their shingle sets, |A&cap;B| / |A&cup;B|, expressed as a percentage 0..100.
 */
@Service
@RequiredArgsConstructor
public class PlagiarismService {

    /** Pairs scoring at or above this percentage are persisted as reports. */
    private static final BigDecimal FLAG_THRESHOLD = new BigDecimal("30.00");

    /** Number of consecutive words per shingle. */
    private static final int SHINGLE_SIZE = 3;

    private static final BigDecimal HUNDRED = new BigDecimal("100");

    private final PlagiarismReportRepository plagiarismReportRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final TeacherScope teacherScope;
    private final AuditLogService auditLogService;

    @Transactional
    public List<PlagiarismReportDto> check(CheckPlagiarismRequest request, AuthenticatedUser actor) {
        Assignment assignment = assignmentRepository.findById(request.assignmentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", request.assignmentId()));
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());

        // A fresh check fully replaces any earlier reports for this assignment.
        plagiarismReportRepository.deleteAllByAssignmentId(assignment.getId());

        // Build the shingle set for each submission, skipping blank / too-short texts.
        // LinkedHashMap keeps input order deterministic for stable pairing.
        Map<Long, Set<String>> shinglesByStudent = new LinkedHashMap<>();
        for (SubmissionText submission : request.submissions()) {
            Set<String> shingles = shingles(submission.text());
            if (!shingles.isEmpty()) {
                shinglesByStudent.put(submission.studentId(), shingles);
            }
        }

        List<Long> studentIds = new ArrayList<>(shinglesByStudent.keySet());
        Instant now = Instant.now();
        List<PlagiarismReport> flagged = new ArrayList<>();
        for (int i = 0; i < studentIds.size(); i++) {
            for (int j = i + 1; j < studentIds.size(); j++) {
                Long idA = studentIds.get(i);
                Long idB = studentIds.get(j);
                BigDecimal similarity =
                        jaccardPercentage(shinglesByStudent.get(idA), shinglesByStudent.get(idB));
                if (similarity.compareTo(FLAG_THRESHOLD) >= 0) {
                    Student studentA = studentRepository.findById(idA)
                            .orElseThrow(() -> ResourceNotFoundException.of("Student", idA));
                    Student studentB = studentRepository.findById(idB)
                            .orElseThrow(() -> ResourceNotFoundException.of("Student", idB));
                    flagged.add(PlagiarismReport.builder()
                            .assignment(assignment)
                            .studentA(studentA)
                            .studentB(studentB)
                            .similarity(similarity)
                            .createdAt(now)
                            .build());
                }
            }
        }

        plagiarismReportRepository.saveAll(flagged);
        auditLogService.log("Assignment", assignment.getId(), "PLAGIARISM_CHECK", actor.id(),
                Map.of("assignmentId", assignment.getId(), "flaggedPairs", flagged.size()));

        return flagged.stream()
                .map(PlagiarismReportDto::from)
                .sorted((a, b) -> b.similarity().compareTo(a.similarity()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<PlagiarismReportDto> list(Long assignmentId, AuthenticatedUser actor, Pageable pageable) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", assignmentId));
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());
        return plagiarismReportRepository
                .findAllByAssignmentIdOrderBySimilarityDesc(assignmentId, pageable)
                .map(PlagiarismReportDto::from);
    }

    /**
     * Normalizes {@code text} and reduces it to its set of word 3-shingles. Returns an empty set
     * for blank text or text with fewer than {@link #SHINGLE_SIZE} words.
     */
    private Set<String> shingles(String text) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }
        String normalized = text.toLowerCase()
                .replaceAll("[^\\p{L}\\p{Nd}\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        if (normalized.isEmpty()) {
            return Set.of();
        }
        String[] words = normalized.split(" ");
        if (words.length < SHINGLE_SIZE) {
            return Set.of();
        }
        Set<String> shingles = new HashSet<>();
        for (int i = 0; i + SHINGLE_SIZE <= words.length; i++) {
            StringBuilder shingle = new StringBuilder();
            for (int k = 0; k < SHINGLE_SIZE; k++) {
                if (k > 0) {
                    shingle.append(' ');
                }
                shingle.append(words[i + k]);
            }
            shingles.add(shingle.toString());
        }
        return shingles;
    }

    /** Jaccard index of two non-empty shingle sets as a 0..100 percentage rounded to 2 decimals. */
    private BigDecimal jaccardPercentage(Set<String> a, Set<String> b) {
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        int unionSize = a.size() + b.size() - intersection.size();
        if (unionSize == 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return new BigDecimal(intersection.size())
                .divide(new BigDecimal(unionSize), 6, RoundingMode.HALF_UP)
                .multiply(HUNDRED)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
