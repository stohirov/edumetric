package com.edumetric.backend.organization.dto;

import com.edumetric.backend.organization.domain.AcademicTerm;
import java.time.LocalDate;

public record AcademicTermDto(
        Long id,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        boolean current) {

    public static AcademicTermDto from(AcademicTerm term) {
        return new AcademicTermDto(
                term.getId(),
                term.getName(),
                term.getStartDate(),
                term.getEndDate(),
                term.isCurrent());
    }
}
