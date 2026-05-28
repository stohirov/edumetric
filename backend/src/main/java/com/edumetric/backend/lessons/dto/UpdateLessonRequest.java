package com.edumetric.backend.lessons.dto;

import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public record UpdateLessonRequest(
        Long groupId,
        Long courseId,
        Long teacherId,
        @Size(max = 255) String topic,
        OffsetDateTime scheduledAt
) {
}
