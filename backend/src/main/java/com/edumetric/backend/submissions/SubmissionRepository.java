package com.edumetric.backend.submissions;

import com.edumetric.backend.submissions.domain.Submission;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    Optional<Submission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);

    Optional<Submission> findByStudentIdAndQuizId(Long studentId, Long quizId);

    List<Submission> findAllByStudentIdOrderBySubmittedAtDesc(Long studentId);

    Page<Submission> findAllByStudentIdOrderBySubmittedAtDesc(Long studentId, Pageable pageable);

    Page<Submission> findAllByCourseIdOrderBySubmittedAtDesc(Long courseId, Pageable pageable);

    /** Homework submission rows for a set of assignments (gradebook "submitted" state). */
    List<Submission> findAllByAssignmentIdIn(Collection<Long> assignmentIds);

    /** Best-attempt quiz rows for a set of quizzes (gradebook quiz cells). */
    List<Submission> findAllByQuizIdIn(Collection<Long> quizIds);
}
