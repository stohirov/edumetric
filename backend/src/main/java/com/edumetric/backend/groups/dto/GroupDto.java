package com.edumetric.backend.groups.dto;

import com.edumetric.backend.groups.domain.Group;
import java.time.LocalDate;

public record GroupDto(
        Long id,
        String name,
        Long courseId,
        String courseName,
        LocalDate startDate,
        LocalDate endDate) {

    public static GroupDto from(Group group) {
        return new GroupDto(
                group.getId(),
                group.getName(),
                group.getCourse().getId(),
                group.getCourse().getName(),
                group.getStartDate(),
                group.getEndDate());
    }
}
