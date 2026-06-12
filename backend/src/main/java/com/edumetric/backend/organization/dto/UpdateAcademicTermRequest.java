package com.edumetric.backend.organization.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record UpdateAcademicTermRequest(
        @Size(max = 255) String name,
        LocalDate startDate,
        LocalDate endDate,
        Boolean current
) {
}
