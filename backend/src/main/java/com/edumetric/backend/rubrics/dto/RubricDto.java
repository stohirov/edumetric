package com.edumetric.backend.rubrics.dto;

import com.edumetric.backend.rubrics.domain.Rubric;
import com.edumetric.backend.rubrics.domain.RubricCriterion;
import java.util.List;

public record RubricDto(Long id, Long assignmentId, String name, List<RubricCriterionDto> criteria) {

    public static RubricDto from(Rubric rubric, List<RubricCriterion> criteria) {
        return new RubricDto(
                rubric.getId(),
                rubric.getAssignment().getId(),
                rubric.getName(),
                criteria.stream().map(RubricCriterionDto::from).toList());
    }
}
