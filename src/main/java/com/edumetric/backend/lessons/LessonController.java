package com.edumetric.backend.lessons;

import com.edumetric.backend.attendance.AttendanceService;
import com.edumetric.backend.attendance.dto.AttendanceDto;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.lessons.dto.LessonDto;
import com.edumetric.backend.security.AuthenticatedUser;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lessons")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;
    private final AttendanceService attendanceService;

    @GetMapping("/today")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<LessonDto>>> today(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(lessonService.today(principal)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<LessonDto>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(lessonService.get(id)));
    }

    @GetMapping("/{id}/attendance")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> attendance(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.forLesson(id)));
    }
}
