package com.edumetric.backend.teaching.dto;

import com.edumetric.backend.teaching.domain.AssignmentRole;
import jakarta.validation.constraints.NotNull;

public record AssignTeacherRequest(
        @NotNull Long courseId,
        @NotNull Long teacherId,
        AssignmentRole role) {

    public AssignmentRole roleOrDefault() {
        return role != null ? role : AssignmentRole.CO_TEACHER;
    }
}
