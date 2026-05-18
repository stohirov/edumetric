package com.edumetric.backend.courses.dto;

import com.edumetric.backend.courses.domain.Course;

public record CourseDto(Long id, String name, String code, String description) {

    public static CourseDto from(Course course) {
        return new CourseDto(course.getId(), course.getName(), course.getCode(), course.getDescription());
    }
}
