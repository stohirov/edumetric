package com.edumetric.backend.certificates;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.certificates.domain.CourseCompletion;
import com.edumetric.backend.certificates.dto.CertificateDto;
import com.edumetric.backend.certificates.dto.CertificateVerificationDto;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.content.CourseMaterialRepository;
import com.edumetric.backend.content.CourseModuleRepository;
import com.edumetric.backend.content.MaterialCompletionRepository;
import com.edumetric.backend.content.domain.CourseMaterial;
import com.edumetric.backend.content.domain.CourseModule;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private static final String CODE_PREFIX = "EM-";
    private static final String CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int CODE_LENGTH = 10;
    private static final int MAX_CODE_ATTEMPTS = 25;

    private final SecureRandom secureRandom = new SecureRandom();

    private final CourseCompletionRepository courseCompletionRepository;
    private final StudentRepository studentRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final MaterialCompletionRepository materialCompletionRepository;
    private final AuditLogService auditLogService;

    /**
     * Claims a completion certificate for the calling student's course. Idempotent: if a
     * certificate already exists it is returned unchanged.
     */
    @Transactional
    public CertificateDto claim(AuthenticatedUser actor) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (student.getGroup() == null || student.getGroup().getCourse() == null) {
            throw new BadRequestException("No course");
        }
        Course course = student.getGroup().getCourse();

        Set<Long> publishedMaterialIds = publishedMaterialIds(course.getId());
        if (publishedMaterialIds.isEmpty()) {
            throw new BadRequestException("Course has no content yet");
        }

        Set<Long> completedMaterialIds = materialCompletionRepository.findAllByStudentId(student.getId()).stream()
                .map(mc -> mc.getMaterial().getId())
                .collect(Collectors.toSet());

        if (!completedMaterialIds.containsAll(publishedMaterialIds)) {
            throw new BadRequestException("Course is not fully completed yet");
        }

        CourseCompletion completion = courseCompletionRepository
                .findByStudentIdAndCourseId(student.getId(), course.getId())
                .orElseGet(() -> {
                    CourseCompletion saved = courseCompletionRepository.save(CourseCompletion.builder()
                            .student(student)
                            .course(course)
                            .certificateCode(generateUniqueCode())
                            .completedAt(Instant.now())
                            .build());
                    auditLogService.log("CourseCompletion", saved.getId(), "COURSE_COMPLETION_CLAIM",
                            actor.id(), CertificateDto.from(saved));
                    return saved;
                });

        return CertificateDto.from(completion);
    }

    /** Lists all completion certificates owned by the calling student. */
    @Transactional(readOnly = true)
    public Page<CertificateDto> myCertificates(AuthenticatedUser actor, Pageable pageable) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return courseCompletionRepository.findAllByStudentId(student.getId(), pageable)
                .map(CertificateDto::from);
    }

    /** Publicly verifies a certificate code without authentication. */
    @Transactional(readOnly = true)
    public CertificateVerificationDto verify(String code) {
        return courseCompletionRepository.findByCertificateCode(code)
                .map(c -> new CertificateVerificationDto(
                        true,
                        c.getStudent().getUser().getFullName(),
                        c.getCourse().getName(),
                        c.getCompletedAt(),
                        c.getCertificateCode()))
                .orElseGet(() -> new CertificateVerificationDto(false, null, null, null, code));
    }

    private Set<Long> publishedMaterialIds(Long courseId) {
        Set<Long> ids = new HashSet<>();
        for (CourseModule module : courseModuleRepository
                .findAllByCourseIdAndPublishedTrueOrderByPositionAscIdAsc(courseId)) {
            for (CourseMaterial material : courseMaterialRepository
                    .findAllByModuleIdAndPublishedTrueOrderByPositionAscIdAsc(module.getId())) {
                ids.add(material.getId());
            }
        }
        return ids;
    }

    private String generateUniqueCode() {
        for (int attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
            String code = randomCode();
            if (courseCompletionRepository.findByCertificateCode(code).isEmpty()) {
                return code;
            }
        }
        throw new BadRequestException("Could not generate a unique certificate code, please retry");
    }

    private String randomCode() {
        StringBuilder sb = new StringBuilder(CODE_PREFIX);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CODE_ALPHABET.charAt(secureRandom.nextInt(CODE_ALPHABET.length())));
        }
        return sb.toString();
    }
}
