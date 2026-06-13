package com.edumetric.backend.catalog;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.catalog.domain.EnrollmentRequest;
import com.edumetric.backend.catalog.domain.EnrollmentRequestStatus;
import com.edumetric.backend.catalog.dto.CatalogItemDto;
import com.edumetric.backend.catalog.dto.EnrollmentRequestDto;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.enrollment.EnrollmentService;
import com.edumetric.backend.enrollment.dto.EnrollRequest;
import com.edumetric.backend.groups.GroupRepository;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import java.time.Instant;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final GroupRepository groupRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRequestRepository enrollmentRequestRepository;
    private final EnrollmentService enrollmentService;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    /** Open offerings: every group is browsable in the catalog. */
    @Transactional(readOnly = true)
    public Page<CatalogItemDto> catalog(Pageable pageable) {
        return groupRepository.findAll(pageable).map(CatalogItemDto::from);
    }

    @Transactional
    public EnrollmentRequestDto request(Long actorUserId, Long groupId, String message) {
        Student student = studentRepository.findByUserId(actorUserId)
                .orElseThrow(() -> ResourceNotFoundException.of("Student for user", actorUserId));
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> ResourceNotFoundException.of("Group", groupId));

        if (enrollmentRequestRepository.existsByStudentIdAndGroupIdAndStatus(
                student.getId(), group.getId(), EnrollmentRequestStatus.PENDING)) {
            throw new ConflictException(
                    "Student " + student.getId()
                            + " already has a pending enrollment request for group " + group.getId());
        }

        EnrollmentRequest entity = EnrollmentRequest.builder()
                .student(student)
                .group(group)
                .status(EnrollmentRequestStatus.PENDING)
                .message(message)
                .createdAt(Instant.now())
                .build();
        EnrollmentRequest saved = enrollmentRequestRepository.save(entity);

        auditLogService.log("EnrollmentRequest", saved.getId(), "ENROLLMENT_REQUEST_CREATE",
                actorUserId,
                Map.of(
                        "studentId", student.getId(),
                        "groupId", group.getId()));
        return EnrollmentRequestDto.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<EnrollmentRequestDto> myRequests(Long actorUserId, Pageable pageable) {
        Student student = studentRepository.findByUserId(actorUserId)
                .orElseThrow(() -> ResourceNotFoundException.of("Student for user", actorUserId));
        return enrollmentRequestRepository
                .findAllByStudentIdOrderByCreatedAtDesc(student.getId(), pageable)
                .map(EnrollmentRequestDto::from);
    }

    @Transactional(readOnly = true)
    public Page<EnrollmentRequestDto> pending(Pageable pageable) {
        return enrollmentRequestRepository
                .findAllByStatusOrderByCreatedAtDesc(EnrollmentRequestStatus.PENDING, pageable)
                .map(EnrollmentRequestDto::from);
    }

    @Transactional
    public EnrollmentRequestDto approve(Long requestId, Long actorUserId) {
        EnrollmentRequest request = enrollmentRequestRepository.findById(requestId)
                .orElseThrow(() -> ResourceNotFoundException.of("EnrollmentRequest", requestId));

        if (request.getStatus() != EnrollmentRequestStatus.PENDING) {
            throw new ConflictException(
                    "Enrollment request " + requestId + " is not pending and cannot be approved");
        }

        User actor = resolveActor(actorUserId);
        request.setStatus(EnrollmentRequestStatus.APPROVED);
        request.setDecidedBy(actor);
        request.setDecidedAt(Instant.now());
        EnrollmentRequest saved = enrollmentRequestRepository.save(request);

        Long studentId = request.getStudent().getId();
        Long groupId = request.getGroup().getId();
        enrollmentService.enroll(
                new EnrollRequest(studentId, groupId, "Enrollment request " + requestId + " approved"),
                actorUserId);

        auditLogService.log("EnrollmentRequest", saved.getId(), "ENROLLMENT_REQUEST_APPROVE",
                actorUserId,
                Map.of(
                        "studentId", studentId,
                        "groupId", groupId));
        return EnrollmentRequestDto.from(saved);
    }

    @Transactional
    public EnrollmentRequestDto reject(Long requestId, Long actorUserId) {
        EnrollmentRequest request = enrollmentRequestRepository.findById(requestId)
                .orElseThrow(() -> ResourceNotFoundException.of("EnrollmentRequest", requestId));

        if (request.getStatus() != EnrollmentRequestStatus.PENDING) {
            throw new ConflictException(
                    "Enrollment request " + requestId + " is not pending and cannot be rejected");
        }

        User actor = resolveActor(actorUserId);
        request.setStatus(EnrollmentRequestStatus.REJECTED);
        request.setDecidedBy(actor);
        request.setDecidedAt(Instant.now());
        EnrollmentRequest saved = enrollmentRequestRepository.save(request);

        auditLogService.log("EnrollmentRequest", saved.getId(), "ENROLLMENT_REQUEST_REJECT",
                actorUserId,
                Map.of(
                        "studentId", request.getStudent().getId(),
                        "groupId", request.getGroup().getId()));
        return EnrollmentRequestDto.from(saved);
    }

    private User resolveActor(Long actorUserId) {
        if (actorUserId == null) {
            return null;
        }
        return userRepository.findById(actorUserId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", actorUserId));
    }
}
