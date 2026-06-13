package com.edumetric.backend.enrollment;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.enrollment.domain.Enrollment;
import com.edumetric.backend.enrollment.domain.EnrollmentStatus;
import com.edumetric.backend.enrollment.dto.EnrollRequest;
import com.edumetric.backend.enrollment.dto.EnrollmentDto;
import com.edumetric.backend.enrollment.dto.TransferRequest;
import com.edumetric.backend.enrollment.dto.WithdrawRequest;
import com.edumetric.backend.groups.GroupRepository;
import com.edumetric.backend.groups.domain.Group;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final TeacherScope teacherScope;

    @Transactional(readOnly = true)
    public List<EnrollmentDto> history(Long studentId, AuthenticatedUser actor) {
        if (!studentRepository.existsById(studentId)) {
            throw ResourceNotFoundException.of("Student", studentId);
        }
        teacherScope.assertCanWriteFor(actor, studentId);
        return enrollmentRepository
                .findAllByStudentIdOrderByEnrolledAtDescCreatedAtDesc(studentId).stream()
                .map(EnrollmentDto::from)
                .toList();
    }

    @Transactional
    public EnrollmentDto enroll(EnrollRequest request, Long actorUserId) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", request.studentId()));
        Group group = groupRepository.findById(request.groupId())
                .orElseThrow(() -> ResourceNotFoundException.of("Group", request.groupId()));

        enrollmentRepository
                .findFirstByStudentIdAndStatus(student.getId(), EnrollmentStatus.ACTIVE)
                .ifPresent(active -> {
                    throw new ConflictException(
                            "Student " + student.getId()
                                    + " already has an active enrollment; use transfer instead");
                });

        User actor = resolveActor(actorUserId);
        LocalDate today = LocalDate.now();

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .group(group)
                .status(EnrollmentStatus.ACTIVE)
                .enrolledAt(today)
                .reason(request.reason())
                .createdBy(actor)
                .createdAt(Instant.now())
                .build();
        Enrollment saved = enrollmentRepository.save(enrollment);

        student.setGroup(group);
        studentRepository.save(student);

        auditLogService.log("Enrollment", saved.getId(), "ENROLL", actorUserId,
                Map.of(
                        "studentId", student.getId(),
                        "groupId", group.getId()));
        return EnrollmentDto.from(saved);
    }

    @Transactional
    public EnrollmentDto withdraw(WithdrawRequest request, Long actorUserId) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", request.studentId()));

        Enrollment active = enrollmentRepository
                .findFirstByStudentIdAndStatus(student.getId(), EnrollmentStatus.ACTIVE)
                .orElseThrow(() -> new ConflictException(
                        "Student " + student.getId() + " has no active enrollment to withdraw"));

        active.setStatus(EnrollmentStatus.WITHDRAWN);
        active.setEndedAt(LocalDate.now());
        active.setReason(request.reason());
        Enrollment saved = enrollmentRepository.save(active);

        student.setGroup(null);
        studentRepository.save(student);

        auditLogService.log("Enrollment", saved.getId(), "WITHDRAW", actorUserId,
                Map.of("studentId", student.getId()));
        return EnrollmentDto.from(saved);
    }

    @Transactional
    public EnrollmentDto transfer(TransferRequest request, Long actorUserId) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", request.studentId()));
        Group newGroup = groupRepository.findById(request.groupId())
                .orElseThrow(() -> ResourceNotFoundException.of("Group", request.groupId()));

        Enrollment active = enrollmentRepository
                .findFirstByStudentIdAndStatus(student.getId(), EnrollmentStatus.ACTIVE)
                .orElseThrow(() -> new ConflictException(
                        "Student " + student.getId() + " has no active enrollment to transfer"));

        User actor = resolveActor(actorUserId);
        LocalDate today = LocalDate.now();

        active.setStatus(EnrollmentStatus.TRANSFERRED);
        active.setEndedAt(today);
        active.setReason(request.reason());
        enrollmentRepository.save(active);

        Enrollment next = Enrollment.builder()
                .student(student)
                .group(newGroup)
                .status(EnrollmentStatus.ACTIVE)
                .enrolledAt(today)
                .reason(request.reason())
                .createdBy(actor)
                .createdAt(Instant.now())
                .build();
        Enrollment saved = enrollmentRepository.save(next);

        student.setGroup(newGroup);
        studentRepository.save(student);

        auditLogService.log("Enrollment", saved.getId(), "TRANSFER", actorUserId,
                Map.of(
                        "studentId", student.getId(),
                        "fromGroupId", active.getGroup().getId(),
                        "toGroupId", newGroup.getId()));
        return EnrollmentDto.from(saved);
    }

    private User resolveActor(Long actorUserId) {
        if (actorUserId == null) {
            return null;
        }
        return userRepository.findById(actorUserId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", actorUserId));
    }
}
