package com.edumetric.backend.plagiarism;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.plagiarism.dto.CheckPlagiarismRequest;
import com.edumetric.backend.plagiarism.dto.PlagiarismReportDto;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
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
@RequestMapping("/api/plagiarism")
@RequiredArgsConstructor
public class PlagiarismController {

    private final PlagiarismService plagiarismService;

    /** Runs a pairwise similarity check over a batch of submissions and stores flagged pairs. */
    @PostMapping("/check")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<PlagiarismReportDto>>> check(
            @Valid @RequestBody CheckPlagiarismRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(plagiarismService.check(request, principal)));
    }

    /** Returns the stored flagged pairs for an assignment, highest similarity first. */
    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<PlagiarismReportDto>>> list(
            @RequestParam Long assignmentId,
            @AuthenticationPrincipal AuthenticatedUser principal,
            Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(plagiarismService.list(assignmentId, principal, pageable))));
    }
}
