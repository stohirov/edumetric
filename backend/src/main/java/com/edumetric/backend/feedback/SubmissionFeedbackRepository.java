package com.edumetric.backend.feedback;

import com.edumetric.backend.feedback.domain.SubmissionFeedback;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionFeedbackRepository extends JpaRepository<SubmissionFeedback, Long> {

    List<SubmissionFeedback> findAllByAssignmentIdAndStudentIdOrderByCreatedAtAsc(
            Long assignmentId, Long studentId);
}
