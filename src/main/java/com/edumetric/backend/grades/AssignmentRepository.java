package com.edumetric.backend.grades;

import com.edumetric.backend.grades.domain.Assignment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findAllByCourseId(Long courseId);
}
