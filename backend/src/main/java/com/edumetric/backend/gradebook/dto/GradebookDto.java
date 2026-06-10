package com.edumetric.backend.gradebook.dto;

import com.edumetric.backend.settings.domain.GradingScale;
import java.util.List;

/** The full gradebook matrix for a course: assignment columns × student rows. */
public record GradebookDto(
        Long courseId,
        String courseName,
        GradingScale gradingScale,
        List<GradebookColumnDto> columns,
        List<GradebookRowDto> rows) {
}
