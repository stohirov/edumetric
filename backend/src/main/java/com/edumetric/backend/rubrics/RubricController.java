package com.edumetric.backend.rubrics;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.rubrics.dto.RubricDto;
import com.edumetric.backend.rubrics.dto.RubricScoreDto;
import com.edumetric.backend.rubrics.dto.ScoreRubricRequest;
import com.edumetric.backend.rubrics.dto.ScoreRubricResult;
import com.edumetric.backend.rubrics.dto.UpsertRubricRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rubrics")
@RequiredArgsConstructor
public class RubricController {

    private final RubricService rubricService;

    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<RubricDto>> getRubric(
            @RequestParam Long assignmentId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(rubricService.getRubric(assignmentId, principal)));
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<RubricDto>> upsertRubric(
            @Valid @RequestBody UpsertRubricRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(rubricService.upsertRubric(request, principal)));
    }

    @GetMapping("/scores")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<List<RubricScoreDto>>> getScores(
            @RequestParam Long assignmentId,
            @RequestParam Long studentId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(
                ApiResponse.ok(rubricService.getScores(assignmentId, studentId, principal)));
    }

    @PostMapping("/score")
    @PreAuthorize("hasAnyRole('TEACHER','ADMIN')")
    public ResponseEntity<ApiResponse<ScoreRubricResult>> score(
            @Valid @RequestBody ScoreRubricRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(rubricService.score(request, principal)));
    }
}
