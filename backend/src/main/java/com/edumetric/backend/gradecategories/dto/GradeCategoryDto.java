package com.edumetric.backend.gradecategories.dto;

import com.edumetric.backend.gradecategories.domain.GradeCategory;
import java.math.BigDecimal;

/** A grade category as exposed to teachers/admins. */
public record GradeCategoryDto(
        Long id,
        Long courseId,
        String name,
        BigDecimal weight,
        int position) {

    public static GradeCategoryDto from(GradeCategory category) {
        return new GradeCategoryDto(
                category.getId(),
                category.getCourse().getId(),
                category.getName(),
                category.getWeight(),
                category.getPosition());
    }
}
