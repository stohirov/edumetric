package com.edumetric.backend.appeals;

import com.edumetric.backend.appeals.domain.AppealStatus;
import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.appeals.domain.GradeAppeal;
import com.edumetric.backend.appeals.dto.CreateAppealRequest;
import com.edumetric.backend.appeals.dto.GradeAppealDto;
import com.edumetric.backend.appeals.dto.RejectAppealRequest;
import com.edumetric.backend.appeals.dto.ResolveAppealRequest;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.grades.AssignmentRepository;
import com.edumetric.backend.grades.GradeService;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.grades.dto.CreateGradeRequest;
import com.edumetric.backend.lessons.LessonRepository;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class GradeAppealService {

    private static final String ENTITY_TYPE = "GradeAppeal";

    private final GradeAppealRepository gradeAppealRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final GradeService gradeService;
    private final TeacherScope teacherScope;
    private final LessonRepository lessonRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public GradeAppealDto open(CreateAppealRequest request, AuthenticatedUser actor) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
        Assignment assignment = assignmentRepository.findById(request.assignmentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", request.assignmentId()));

        GradeAppeal appeal = GradeAppeal.builder()
                .assignment(assignment)
                .student(student)
                .reason(request.reason())
                .status(AppealStatus.PENDING)
                .createdAt(Instant.now())
                .build();
        GradeAppeal saved = gradeAppealRepository.save(appeal);
        auditLogService.log(ENTITY_TYPE, saved.getId(), "GRADE_APPEAL_OPEN", actor.id(), request);
        return GradeAppealDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<GradeAppealDto> myAppeals(AuthenticatedUser actor) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
        return gradeAppealRepository.findAllByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
                .map(GradeAppealDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GradeAppealDto> pending(AuthenticatedUser actor) {
        List<GradeAppeal> pending = gradeAppealRepository.findAllByStatusOrderByCreatedAtDesc(AppealStatus.PENDING);
        if (actor.role() == Role.ADMIN) {
            return pending.stream().map(GradeAppealDto::from).toList();
        }
        // TEACHER: only appeals for courses they teach.
        return pending.stream()
                .filter(a -> lessonRepository.teacherUserTeachesCourse(
                        actor.id(), a.getAssignment().getCourse().getId()))
                .map(GradeAppealDto::from)
                .toList();
    }

    @Transactional
    public GradeAppealDto resolve(Long id, ResolveAppealRequest request, AuthenticatedUser actor) {
        GradeAppeal appeal = gradeAppealRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("GradeAppeal", id));
        teacherScope.assertTeachesCourse(actor, appeal.getAssignment().getCourse().getId());

        if (request.newValue() != null) {
            gradeService.create(
                    new CreateGradeRequest(
                            appeal.getStudent().getId(),
                            appeal.getAssignment().getId(),
                            request.newValue(),
                            null),
                    actor);
        }

        User resolver = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));
        appeal.setStatus(AppealStatus.RESOLVED);
        appeal.setResolution(request.resolution());
        appeal.setResolvedBy(resolver);
        appeal.setResolvedAt(Instant.now());
        auditLogService.log(ENTITY_TYPE, appeal.getId(), "GRADE_APPEAL_RESOLVE", actor.id(), request);
        return GradeAppealDto.from(appeal);
    }

    @Transactional
    public GradeAppealDto reject(Long id, RejectAppealRequest request, AuthenticatedUser actor) {
        GradeAppeal appeal = gradeAppealRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("GradeAppeal", id));
        teacherScope.assertTeachesCourse(actor, appeal.getAssignment().getCourse().getId());

        User resolver = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));
        appeal.setStatus(AppealStatus.REJECTED);
        appeal.setResolution(request.resolution());
        appeal.setResolvedBy(resolver);
        appeal.setResolvedAt(Instant.now());
        auditLogService.log(ENTITY_TYPE, appeal.getId(), "GRADE_APPEAL_REJECT", actor.id(), request);
        return GradeAppealDto.from(appeal);
    }
}
