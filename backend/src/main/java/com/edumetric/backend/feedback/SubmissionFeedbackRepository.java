package com.edumetric.backend.feedback;

import com.edumetric.backend.feedback.domain.SubmissionFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionFeedbackRepository extends JpaRepository<SubmissionFeedback, Long> {

    Page<SubmissionFeedback> findAllByAssignmentIdAndStudentIdOrderByCreatedAtAsc(
            Long assignmentId, Long studentId, Pageable pageable);
}
