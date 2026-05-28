package com.edumetric.backend.attendance;

import com.edumetric.backend.attendance.dto.AttendanceDto;
import com.edumetric.backend.attendance.dto.BulkAttendanceRequest;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<AttendanceDto>>> bulk(
            @Valid @RequestBody BulkAttendanceRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        attendanceService.bulkUpsert(request, principal);
        return ResponseEntity.ok(ApiResponse.ok(attendanceService.forLesson(request.lessonId())));
    }
}
