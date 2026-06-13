package com.edumetric.backend.gradebook.dto;

import com.edumetric.backend.grades.domain.AssignmentType;
import com.edumetric.backend.settings.domain.GradingScale;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * A single student's unified view of their own standing in a course: every
 * assignment with its grade (or pending/missing state) plus the computed course
 * grade. Deliberately omits cohort stats so a student never sees peers' data.
 */
public record StudentCourseGradesDto(
        Long courseId,
        String courseName,
        GradingScale gradingScale,
        Double coursePercent,
        String display,
        List<Item> items) {

    public record Item(
            String key,
            Long assignmentId,
            Long quizId,
            String name,
            AssignmentType type,
            BigDecimal value,
            BigDecimal maxValue,
            BigDecimal weight,
            Double percent,
            boolean graded,
            boolean submitted,
            LocalDate dueDate,
            Instant gradedAt,
            String comment) {
    }
}
