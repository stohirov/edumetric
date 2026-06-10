package com.edumetric.backend.content.dto;

import java.util.List;

/** The full published curriculum of a student's course, with overall progress. */
public record CourseContentDto(
        Long courseId,
        String courseName,
        int totalMaterials,
        int completedMaterials,
        List<StudentModuleDto> modules) {
}
