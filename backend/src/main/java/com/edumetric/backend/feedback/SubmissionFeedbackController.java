package com.edumetric.backend.feedback;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.feedback.dto.CreateFeedbackRequest;
import com.edumetric.backend.feedback.dto.FeedbackDto;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class SubmissionFeedbackController {

    private final SubmissionFeedbackService submissionFeedbackService;

    /** Teacher/admin posts written feedback for a student on an assignment. */
    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<FeedbackDto>> post(
            @Valid @RequestBody CreateFeedbackRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(submissionFeedbackService.post(request, principal)));
    }

    /** Teacher/admin lists all feedback for a student on an assignment they teach. */
    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<FeedbackDto>>> list(
            @RequestParam Long assignmentId,
            @RequestParam Long studentId,
            @AuthenticationPrincipal AuthenticatedUser principal,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(
                submissionFeedbackService.listForTeacher(assignmentId, studentId, principal, pageable))));
    }

    /** Student reads feedback addressed to them on an assignment. */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<FeedbackDto>>> listForMe(
            @RequestParam Long assignmentId,
            @AuthenticationPrincipal AuthenticatedUser principal,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(
                submissionFeedbackService.listForStudent(assignmentId, principal, pageable))));
    }
}
