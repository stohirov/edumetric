package com.edumetric.backend.submissions;

import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.quizzes.domain.Quiz;
import com.edumetric.backend.quizzes.domain.QuizAttempt;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.submissions.domain.Submission;
import com.edumetric.backend.submissions.domain.SubmissionKind;
import com.edumetric.backend.submissions.domain.SubmissionStatus;
import com.edumetric.backend.submissions.dto.SubmissionDto;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The single writer (and reader) for the canonical {@code submissions} table.
 * Other slices call the {@code record*}/{@code markGraded} hooks transactionally
 * alongside their own source write so the unified table never drifts. Reads power
 * a single submission inbox and the gradebook's mark lookups.
 */
@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final StudentRepository studentRepository;
    private final TeacherScope teacherScope;

    /** Upserts the (student, assignment) homework row on each (re)submission. */
    @Transactional
    public void recordHomeworkSubmission(Student student, Assignment assignment, Instant submittedAt) {
        Submission submission = submissionRepository
                .findByStudentIdAndAssignmentId(student.getId(), assignment.getId())
                .orElseGet(() -> Submission.builder()
                        .student(student)
                        .course(assignment.getCourse())
                        .kind(SubmissionKind.HOMEWORK)
                        .assignment(assignment)
                        .status(SubmissionStatus.SUBMITTED)
                        .attemptCount(0)
                        .build());
        submission.setSubmittedAt(submittedAt);
        submission.setAttemptCount(submission.getAttemptCount() + 1);
        // Newly (re)submitted work is ungraded again until a teacher posts a grade.
        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setScore(null);
        submission.setMaxScore(null);
        submission.setGradedAt(null);
        submissionRepository.save(submission);
    }

    /** Mirrors a posted grade onto the homework row (no-op if the student never submitted). */
    @Transactional
    public void markGraded(Long studentId, Assignment assignment, BigDecimal score, Instant gradedAt) {
        submissionRepository.findByStudentIdAndAssignmentId(studentId, assignment.getId())
                .ifPresent(submission -> {
                    submission.setStatus(SubmissionStatus.GRADED);
                    submission.setScore(score);
                    submission.setMaxScore(assignment.getMaxValue());
                    submission.setGradedAt(gradedAt);
                    submissionRepository.save(submission);
                });
    }

    /** Reverts a homework row to ungraded when its grade is deleted. */
    @Transactional
    public void markUngraded(Long studentId, Long assignmentId) {
        submissionRepository.findByStudentIdAndAssignmentId(studentId, assignmentId)
                .ifPresent(submission -> {
                    submission.setStatus(SubmissionStatus.SUBMITTED);
                    submission.setScore(null);
                    submission.setMaxScore(null);
                    submission.setGradedAt(null);
                    submissionRepository.save(submission);
                });
    }

    /** Upserts the (student, quiz) row, keeping the best attempt's auto-graded mark. */
    @Transactional
    public void recordQuizAttempt(Student student, Quiz quiz, QuizAttempt attempt) {
        Submission submission = submissionRepository
                .findByStudentIdAndQuizId(student.getId(), quiz.getId())
                .orElseGet(() -> Submission.builder()
                        .student(student)
                        .course(quiz.getCourse())
                        .kind(SubmissionKind.QUIZ)
                        .quiz(quiz)
                        .status(SubmissionStatus.GRADED)
                        .attemptCount(0)
                        .build());
        submission.setAttemptCount(submission.getAttemptCount() + 1);
        // Keep the highest-percent attempt as the canonical mark.
        if (submission.getScore() == null
                || percent(attempt.getScore(), attempt.getMaxScore())
                        >= percent(submission.getScore(), submission.getMaxScore())) {
            submission.setScore(attempt.getScore());
            submission.setMaxScore(attempt.getMaxScore());
            submission.setSubmittedAt(attempt.getSubmittedAt());
            submission.setGradedAt(attempt.getSubmittedAt());
            submission.setStatus(SubmissionStatus.GRADED);
        }
        submissionRepository.save(submission);
    }

    /** The signed-in student's own unified submission history. */
    @Transactional(readOnly = true)
    public Page<SubmissionDto> mySubmissions(AuthenticatedUser actor, Pageable pageable) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
        return submissionRepository.findAllByStudentIdOrderBySubmittedAtDesc(student.getId(), pageable)
                .map(SubmissionDto::from);
    }

    /** Every submission in a course (teacher/admin), homework and quizzes side by side. */
    @Transactional(readOnly = true)
    public Page<SubmissionDto> courseSubmissions(Long courseId, AuthenticatedUser actor, Pageable pageable) {
        teacherScope.assertTeachesCourse(actor, courseId);
        return submissionRepository.findAllByCourseIdOrderBySubmittedAtDesc(courseId, pageable)
                .map(SubmissionDto::from);
    }

    private static double percent(BigDecimal score, BigDecimal maxScore) {
        if (score == null || maxScore == null || maxScore.signum() <= 0) {
            return 0;
        }
        return score.doubleValue() / maxScore.doubleValue() * 100.0;
    }
}
