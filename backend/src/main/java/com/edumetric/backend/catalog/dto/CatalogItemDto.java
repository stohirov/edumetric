package com.edumetric.backend.catalog.dto;

import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.groups.domain.Group;
import java.time.LocalDate;

public record CatalogItemDto(
        Long groupId,
        String groupName,
        Long courseId,
        String courseName,
        String courseDescription,
        LocalDate startDate,
        LocalDate endDate) {

    public static CatalogItemDto from(Group group) {
        Course course = group.getCourse();
        return new CatalogItemDto(
                group.getId(),
                group.getName(),
                course.getId(),
                course.getName(),
                course.getDescription(),
                group.getStartDate(),
                group.getEndDate());
    }
}
