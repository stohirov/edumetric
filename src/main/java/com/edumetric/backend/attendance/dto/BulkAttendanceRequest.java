package com.edumetric.backend.attendance.dto;

import com.edumetric.backend.attendance.domain.AttendanceStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BulkAttendanceRequest(
        @NotNull Long lessonId,
        @NotEmpty @Valid List<Entry> entries
) {
    public record Entry(
            @NotNull Long studentId,
            @NotNull AttendanceStatus status,
            String comment
    ) {
    }
}
