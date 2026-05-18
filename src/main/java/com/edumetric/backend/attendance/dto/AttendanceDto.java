package com.edumetric.backend.attendance.dto;

import com.edumetric.backend.attendance.domain.Attendance;
import com.edumetric.backend.attendance.domain.AttendanceStatus;
import java.time.Instant;

public record AttendanceDto(
        Long id,
        Long studentId,
        String studentName,
        Long lessonId,
        AttendanceStatus status,
        Long markedByUserId,
        Instant markedAt,
        String comment) {

    public static AttendanceDto from(Attendance attendance) {
        return new AttendanceDto(
                attendance.getId(),
                attendance.getStudent().getId(),
                attendance.getStudent().getUser().getFullName(),
                attendance.getLesson().getId(),
                attendance.getStatus(),
                attendance.getMarkedBy().getId(),
                attendance.getMarkedAt(),
                attendance.getComment());
    }
}
