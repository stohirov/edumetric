package com.edumetric.backend.homework;

import com.edumetric.backend.homework.domain.HomeworkSubmission;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeworkSubmissionRepository extends JpaRepository<HomeworkSubmission, Long> {

    List<HomeworkSubmission> findAllByStudentId(Long studentId);

    List<HomeworkSubmission> findAllByAssignmentIdOrderBySubmittedAtDesc(Long assignmentId);

    List<HomeworkSubmission> findAllByAssignmentIdIn(Collection<Long> assignmentIds);

    Optional<HomeworkSubmission> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
}
