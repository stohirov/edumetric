package com.edumetric.backend.lessons.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public record CreateLessonRequest(
        @NotNull Long groupId,
        @NotNull Long courseId,
        @NotNull Long teacherId,
        @NotBlank @Size(max = 255) String topic,
        @NotNull OffsetDateTime scheduledAt
) {
}
