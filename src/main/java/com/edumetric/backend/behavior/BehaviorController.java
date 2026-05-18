package com.edumetric.backend.behavior;

import com.edumetric.backend.behavior.dto.BehaviorRecordRequest;
import com.edumetric.backend.behavior.dto.BulkBehaviorRequest;
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
@RequestMapping("/api")
@RequiredArgsConstructor
public class BehaviorController {

    private final BehaviorService behaviorService;

    @PostMapping("/behavior")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Integer>> behavior(
            @Valid @RequestBody BehaviorRecordRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(
                ApiResponse.ok(behaviorService.createBehavior(List.of(request), principal).size()));
    }

    @PostMapping("/behavior/bulk")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Integer>> behaviorBulk(
            @Valid @RequestBody BulkBehaviorRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(
                ApiResponse.ok(behaviorService.createBehavior(request.entries(), principal).size()));
    }

    @PostMapping("/activity")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Integer>> activity(
            @Valid @RequestBody BehaviorRecordRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(
                ApiResponse.ok(behaviorService.createActivity(List.of(request), principal).size()));
    }
}
