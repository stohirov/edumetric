package com.edumetric.backend.gradebook;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.gradebook.dto.GradebookDto;
import com.edumetric.backend.gradebook.dto.StudentCourseGradesDto;
import com.edumetric.backend.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gradebook")
@RequiredArgsConstructor
public class GradebookController {

    private final GradebookService gradebookService;

    /** Full students × assignments matrix for a course (optionally a single group). */
    @GetMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<GradebookDto>> gradebook(
            @RequestParam Long courseId,
            @RequestParam(required = false) Long groupId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(gradebookService.gradebook(courseId, groupId, principal)));
    }

    /** The signed-in student's own grades and computed course standing. */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentCourseGradesDto>> myGrades(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(gradebookService.myGrades(principal)));
    }
}
