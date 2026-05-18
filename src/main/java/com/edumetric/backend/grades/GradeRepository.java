package com.edumetric.backend.grades;

import com.edumetric.backend.grades.domain.Grade;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradeRepository extends JpaRepository<Grade, Long> {

    List<Grade> findAllByStudentId(Long studentId);

    List<Grade> findTop10ByStudentIdOrderByGradedAtDesc(Long studentId);

    Optional<Grade> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
}
