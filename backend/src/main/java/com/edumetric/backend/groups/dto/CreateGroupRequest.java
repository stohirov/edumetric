package com.edumetric.backend.groups.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateGroupRequest(
        @NotBlank @Size(max = 255) String name,
        @NotNull Long courseId,
        LocalDate startDate,
        LocalDate endDate
) {
}
