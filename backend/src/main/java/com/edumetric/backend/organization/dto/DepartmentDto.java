package com.edumetric.backend.organization.dto;

import com.edumetric.backend.organization.domain.Department;

public record DepartmentDto(Long id, String name, String code, String description) {

    public static DepartmentDto from(Department department) {
        return new DepartmentDto(
                department.getId(),
                department.getName(),
                department.getCode(),
                department.getDescription());
    }
}
