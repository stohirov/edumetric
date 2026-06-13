package com.edumetric.backend.submissions;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.submissions.dto.SubmissionDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read API over the unified submission table. Homework uploads and quiz attempts
 * appear in one feed — the user-facing payoff of the single submission model.
 */
@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    /** The signed-in student's own submission history (homework + quizzes). */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<SubmissionDto>>> mySubmissions(
            @AuthenticationPrincipal AuthenticatedUser principal,
            Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(submissionService.mySubmissions(principal, pageable))));
    }

    /** Every submission in a course, for a teacher who owns it (or an admin). */
    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<SubmissionDto>>> courseSubmissions(
            @RequestParam Long courseId,
            @AuthenticationPrincipal AuthenticatedUser principal,
            Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(submissionService.courseSubmissions(courseId, principal, pageable))));
    }
}
