package com.edumetric.backend.quizzes;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.quizzes.dto.AttemptResultDto;
import com.edumetric.backend.quizzes.dto.StudentQuizDto;
import com.edumetric.backend.quizzes.dto.SubmitAttemptRequest;
import com.edumetric.backend.quizzes.dto.TakeQuizDto;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
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

/** Student-facing quiz taking. Lives under /api/quizzes alongside the authoring controller. */
@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class StudentQuizController {

    private final QuizAttemptService quizAttemptService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentQuizDto>>> myQuizzes(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(quizAttemptService.listForStudent(principal)));
    }

    @GetMapping("/{id}/take")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<TakeQuizDto>> take(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(quizAttemptService.getQuizToTake(id, principal)));
    }

    @PostMapping("/{id}/attempts")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AttemptResultDto>> submit(
            @PathVariable Long id,
            @Valid @RequestBody SubmitAttemptRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(quizAttemptService.submit(id, request, principal)));
    }
}
