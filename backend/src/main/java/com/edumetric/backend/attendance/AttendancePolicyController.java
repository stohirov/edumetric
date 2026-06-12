package com.edumetric.backend.attendance;

import com.edumetric.backend.attendance.dto.AttendancePolicyDto;
import com.edumetric.backend.attendance.dto.UpdateAttendancePolicyRequest;
import com.edumetric.backend.common.api.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/attendance/policy")
@RequiredArgsConstructor
public class AttendancePolicyController {

    private final AttendancePolicyService service;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AttendancePolicyDto>> get() {
        return ResponseEntity.ok(ApiResponse.ok(service.get()));
    }

    @PatchMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendancePolicyDto>> update(
            @Valid @RequestBody UpdateAttendancePolicyRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(request)));
    }
}
