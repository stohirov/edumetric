package com.edumetric.backend.feedback;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.feedback.domain.SubmissionFeedback;
import com.edumetric.backend.feedback.dto.CreateFeedbackRequest;
import com.edumetric.backend.feedback.dto.FeedbackDto;
import com.edumetric.backend.grades.AssignmentRepository;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SubmissionFeedbackService {

    private final SubmissionFeedbackRepository submissionFeedbackRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final TeacherScope teacherScope;
    private final AuditLogService auditLogService;

    /** Teacher/admin posts feedback for a student on an assignment in a course they teach. */
    @Transactional
    public FeedbackDto post(CreateFeedbackRequest request, AuthenticatedUser actor) {
        Assignment assignment = assignmentRepository.findById(request.assignmentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", request.assignmentId()));
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());

        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", request.studentId()));

        User author = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));

        SubmissionFeedback feedback = submissionFeedbackRepository.save(SubmissionFeedback.builder()
                .assignment(assignment)
                .student(student)
                .author(author)
                .body(request.body())
                .createdAt(Instant.now())
                .build());

        FeedbackDto dto = FeedbackDto.from(feedback);
        auditLogService.log("SubmissionFeedback", feedback.getId(), "FEEDBACK_POST", actor.id(), dto);
        return dto;
    }

    /** Teacher/admin reads all feedback for a student on an assignment they teach. */
    @Transactional(readOnly = true)
    public Page<FeedbackDto> listForTeacher(
            Long assignmentId, Long studentId, AuthenticatedUser actor, Pageable pageable) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", assignmentId));
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());

        return submissionFeedbackRepository
                .findAllByAssignmentIdAndStudentIdOrderByCreatedAtAsc(assignmentId, studentId, pageable)
                .map(FeedbackDto::from);
    }

    /** Student reads feedback addressed to them on an assignment. */
    @Transactional(readOnly = true)
    public Page<FeedbackDto> listForStudent(Long assignmentId, AuthenticatedUser actor, Pageable pageable) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));

        return submissionFeedbackRepository
                .findAllByAssignmentIdAndStudentIdOrderByCreatedAtAsc(assignmentId, student.getId(), pageable)
                .map(FeedbackDto::from);
    }
}
