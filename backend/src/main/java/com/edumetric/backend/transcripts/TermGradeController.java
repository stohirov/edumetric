package com.edumetric.backend.transcripts;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.transcripts.dto.FinalizeRequest;
import com.edumetric.backend.transcripts.dto.TermGradeDto;
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

@RestController
@RequestMapping("/api/transcripts")
@RequiredArgsConstructor
public class TermGradeController {

    private final TermGradeService termGradeService;

    /** Finalize term grades for one student or the whole course roster. */
    @PostMapping("/finalize")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TermGradeDto>>> finalize(
            @Valid @RequestBody FinalizeRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(termGradeService.finalize(request, principal)));
    }

    /** A student's full transcript across terms (teacher/admin). */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<TermGradeDto>>> transcript(
            @PathVariable Long studentId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(termGradeService.transcript(studentId, principal)));
    }

    /** The signed-in student's own transcript. */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<TermGradeDto>>> myTranscript(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(termGradeService.myTranscript(principal)));
    }
}
