package com.edumetric.backend.rubrics;

import com.edumetric.backend.rubrics.domain.Rubric;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RubricRepository extends JpaRepository<Rubric, Long> {

    Optional<Rubric> findByAssignmentId(Long assignmentId);
}
