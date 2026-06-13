package com.edumetric.backend.homework;

import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.grades.AssignmentRepository;
import com.edumetric.backend.grades.GradeRepository;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.grades.domain.Grade;
import com.edumetric.backend.homework.domain.HomeworkSubmission;
import com.edumetric.backend.homework.dto.HomeworkAssignmentDto;
import com.edumetric.backend.homework.dto.SubmissionDto;
import com.edumetric.backend.homework.dto.TeacherSubmissionDto;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.submissions.SubmissionService;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class HomeworkService {

    /** Max upload size accepted by the application layer (defence in depth; multipart also caps this). */
    private static final long MAX_FILE_BYTES = 25L * 1024 * 1024;

    /** File extensions rejected outright as they are commonly used to deliver malware. */
    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            "exe", "bat", "cmd", "com", "msi", "scr", "pif", "cpl",
            "sh", "bash", "ps1", "psm1", "vbs", "vbe", "js", "jse", "jar",
            "app", "dmg", "deb", "rpm", "dll", "so");

    private final HomeworkSubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final FileStorageService fileStorage;
    private final TeacherScope teacherScope;
    private final SubmissionService submissionService;

    /** All assignments for the current student's course, enriched with submission + grade state. */
    @Transactional(readOnly = true)
    public List<HomeworkAssignmentDto> listForCurrentStudent(AuthenticatedUser actor) {
        Student student = resolveStudent(actor);
        if (student.getGroup() == null || student.getGroup().getCourse() == null) {
            return List.of();
        }
        Long courseId = student.getGroup().getCourse().getId();
        String courseName = student.getGroup().getCourse().getName();

        Map<Long, HomeworkSubmission> submissions = submissionRepository.findAllByStudentId(student.getId())
                .stream()
                .collect(Collectors.toMap(s -> s.getAssignment().getId(), Function.identity()));
        Map<Long, Grade> grades = gradeRepository.findAllByStudentId(student.getId())
                .stream()
                .collect(Collectors.toMap(g -> g.getAssignment().getId(), Function.identity()));

        LocalDate today = LocalDate.now();
        return assignmentRepository.findAllByCourseId(courseId).stream()
                .map(a -> HomeworkAssignmentDto.of(
                        a, submissions.get(a.getId()), grades.get(a.getId()), courseName, today))
                .sorted(Comparator
                        .comparing(HomeworkAssignmentDto::dueDate,
                                Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(HomeworkAssignmentDto::name))
                .toList();
    }

    /** Creates or updates the current student's submission for an assignment. */
    @Transactional
    public SubmissionDto submit(Long assignmentId, String comment, MultipartFile file, AuthenticatedUser actor) {
        Student student = resolveStudent(actor);
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", assignmentId));
        assertAssignmentBelongsToStudentCourse(assignment, student);

        boolean hasFile = file != null && !file.isEmpty();
        boolean hasComment = comment != null && !comment.isBlank();
        if (!hasFile && !hasComment) {
            throw new BadRequestException("Provide a file or a comment to submit");
        }

        HomeworkSubmission submission = submissionRepository
                .findByStudentIdAndAssignmentId(student.getId(), assignmentId)
                .orElseGet(() -> HomeworkSubmission.builder()
                        .student(student)
                        .assignment(assignment)
                        .build());

        submission.setComment(hasComment ? comment.trim() : null);

        if (hasFile) {
            validateFile(file);
            String objectKey = "submissions/%d/%d/%s".formatted(
                    student.getId(), assignmentId, sanitizeFileName(file.getOriginalFilename()));
            fileStorage.upload(objectKey, file);
            submission.setFileObjectKey(objectKey);
            submission.setFileName(file.getOriginalFilename());
            submission.setFileSize(file.getSize());
            submission.setContentType(file.getContentType());
        } else {
            // Comment-only re-submit: drop stale file metadata so download() no longer
            // streams a previously uploaded file the student meant to replace.
            submission.setFileObjectKey(null);
            submission.setFileName(null);
            submission.setFileSize(null);
            submission.setContentType(null);
        }

        Instant now = Instant.now();
        submission.setSubmittedAt(now);
        SubmissionDto saved = SubmissionDto.from(submissionRepository.save(submission));
        // Mirror into the unified submission table (single source for the gradebook).
        submissionService.recordHomeworkSubmission(student, assignment, now);
        return saved;
    }

    /** Streams the file the student previously uploaded for an assignment. */
    @Transactional(readOnly = true)
    public DownloadedFile download(Long assignmentId, AuthenticatedUser actor) {
        Student student = resolveStudent(actor);
        HomeworkSubmission submission = submissionRepository
                .findByStudentIdAndAssignmentId(student.getId(), assignmentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Submission", assignmentId));
        if (!submission.hasFile()) {
            throw ResourceNotFoundException.of("Submission file", assignmentId);
        }
        return new DownloadedFile(
                fileStorage.download(submission.getFileObjectKey()),
                submission.getFileName(),
                submission.getContentType(),
                submission.getFileSize());
    }

    /** All submissions for an assignment, for a teacher who owns the assignment's course. */
    @Transactional(readOnly = true)
    public List<TeacherSubmissionDto> listSubmissions(Long assignmentId, AuthenticatedUser actor) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", assignmentId));
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());

        Map<Long, Grade> gradesByStudent = gradeRepository.findAllByAssignmentId(assignmentId).stream()
                .collect(Collectors.toMap(g -> g.getStudent().getId(), Function.identity()));

        return submissionRepository.findAllByAssignmentIdOrderBySubmittedAtDesc(assignmentId).stream()
                .map(s -> TeacherSubmissionDto.of(s, gradesByStudent.get(s.getStudent().getId())))
                .toList();
    }

    /** Streams a student's uploaded file to a teacher who owns the assignment's course. */
    @Transactional(readOnly = true)
    public DownloadedFile downloadForTeacher(Long submissionId, AuthenticatedUser actor) {
        HomeworkSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> ResourceNotFoundException.of("Submission", submissionId));
        teacherScope.assertTeachesCourse(actor, submission.getAssignment().getCourse().getId());
        if (!submission.hasFile()) {
            throw ResourceNotFoundException.of("Submission file", submissionId);
        }
        return new DownloadedFile(
                fileStorage.download(submission.getFileObjectKey()),
                submission.getFileName(),
                submission.getContentType(),
                submission.getFileSize());
    }

    private static void validateFile(MultipartFile file) {
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new BadRequestException("File exceeds the 25 MB limit");
        }
        String name = file.getOriginalFilename();
        if (name != null) {
            int dot = name.lastIndexOf('.');
            if (dot >= 0 && dot < name.length() - 1) {
                String ext = name.substring(dot + 1).toLowerCase(Locale.ROOT);
                if (BLOCKED_EXTENSIONS.contains(ext)) {
                    throw new BadRequestException("File type ." + ext + " is not allowed");
                }
            }
        }
    }

    private Student resolveStudent(AuthenticatedUser actor) {
        return studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
    }

    private void assertAssignmentBelongsToStudentCourse(Assignment assignment, Student student) {
        boolean sameCourse = student.getGroup() != null
                && student.getGroup().getCourse() != null
                && student.getGroup().getCourse().getId().equals(assignment.getCourse().getId());
        if (!sameCourse) {
            throw new BadRequestException("Assignment is not part of your course");
        }
    }

    private static String sanitizeFileName(String original) {
        if (original == null || original.isBlank()) {
            return "upload";
        }
        String stripped = original.replaceAll(".*[/\\\\]", "");
        return stripped.replaceAll("[^A-Za-z0-9._-]", "_");
    }

    /** A file ready to be streamed back to the client. */
    public record DownloadedFile(java.io.InputStream stream, String fileName, String contentType, Long size) {
    }
}
