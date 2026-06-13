package com.edumetric.backend.grades;

import com.edumetric.backend.grades.domain.Assignment;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findAllByCourseId(Long courseId);

    List<Assignment> findAllByCourseIdOrderByDueDateAscNameAsc(Long courseId);

    Page<Assignment> findAllByCourseIdOrderByDueDateAscNameAsc(Long courseId, Pageable pageable);

    List<Assignment> findAllByDueDate(LocalDate dueDate);
}
