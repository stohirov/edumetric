package com.edumetric.backend.appeals;

import com.edumetric.backend.appeals.domain.AppealStatus;
import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.appeals.domain.GradeAppeal;
import com.edumetric.backend.appeals.dto.CreateAppealRequest;
import com.edumetric.backend.appeals.dto.GradeAppealDto;
import com.edumetric.backend.appeals.dto.RejectAppealRequest;
import com.edumetric.backend.appeals.dto.ResolveAppealRequest;
import com.edumetric.backend.common.exception.ConflictException;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public Page<GradeAppealDto> myAppeals(AuthenticatedUser actor, Pageable pageable) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
        return gradeAppealRepository
                .findAllByStudentIdOrderByCreatedAtDesc(student.getId(), pageable)
                .map(GradeAppealDto::from);
    }

    @Transactional(readOnly = true)
    public Page<GradeAppealDto> pending(AuthenticatedUser actor, Pageable pageable) {
        if (actor.role() == Role.ADMIN) {
            return gradeAppealRepository
                    .findAllByStatusOrderByCreatedAtDesc(AppealStatus.PENDING, pageable)
                    .map(GradeAppealDto::from);
        }
        // TEACHER: only appeals for courses they teach — scope pushed into the query.
        List<Long> courseIds = lessonRepository.findCourseIdsForTeacherUser(actor.id());
        if (courseIds.isEmpty()) {
            return Page.empty(pageable);
        }
        return gradeAppealRepository
                .findAllByCourseIdsAndStatus(courseIds, AppealStatus.PENDING, pageable)
                .map(GradeAppealDto::from);
    }

    @Transactional
    public GradeAppealDto resolve(Long id, ResolveAppealRequest request, AuthenticatedUser actor) {
        GradeAppeal appeal = gradeAppealRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("GradeAppeal", id));
        teacherScope.assertTeachesCourse(actor, appeal.getAssignment().getCourse().getId());
        if (appeal.getStatus() != AppealStatus.PENDING) {
            throw new ConflictException("Appeal " + id + " is not pending");
        }

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
        if (appeal.getStatus() != AppealStatus.PENDING) {
            throw new ConflictException("Appeal " + id + " is not pending");
        }

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
