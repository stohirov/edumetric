package com.edumetric.backend.groups.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateGroupRequest(
        @Size(max = 255) String name,
        Long courseId,
        LocalDate startDate,
        LocalDate endDate
) {
}
