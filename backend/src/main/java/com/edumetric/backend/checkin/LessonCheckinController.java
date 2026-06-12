package com.edumetric.backend.checkin;

import com.edumetric.backend.attendance.dto.AttendanceDto;
import com.edumetric.backend.checkin.dto.CheckinSubmitRequest;
import com.edumetric.backend.checkin.dto.LessonCheckinDto;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance/checkin")
@RequiredArgsConstructor
public class LessonCheckinController {

    private final LessonCheckinService checkinService;

    @PostMapping("/open/{lessonId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<LessonCheckinDto>> open(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(checkinService.open(lessonId, principal)));
    }

    @PostMapping("/close/{lessonId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<LessonCheckinDto>> close(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(checkinService.close(lessonId, principal)));
    }

    @GetMapping("/status/{lessonId}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<LessonCheckinDto>> status(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(checkinService.status(lessonId, principal)));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AttendanceDto>> submit(
            @Valid @RequestBody CheckinSubmitRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(checkinService.submit(request.code(), principal)));
    }
}
