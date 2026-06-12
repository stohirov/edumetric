package com.edumetric.backend.rubrics;

import com.edumetric.backend.rubrics.domain.RubricCriterion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RubricCriterionRepository extends JpaRepository<RubricCriterion, Long> {

    List<RubricCriterion> findAllByRubricIdOrderByPositionAscIdAsc(Long rubricId);

    void deleteAllByRubricId(Long rubricId);
}
