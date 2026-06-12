package com.edumetric.backend.syllabus;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.syllabus.dto.SyllabusDto;
import com.edumetric.backend.syllabus.dto.UpsertSyllabusRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Course syllabus: authoring (teacher/admin) and consumption (student). */
@RestController
@RequiredArgsConstructor
public class SyllabusController {

    private final SyllabusService syllabusService;

    // ----- Teacher / admin authoring -------------------------------------------------

    @GetMapping("/api/syllabus")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SyllabusDto>> get(
            @RequestParam Long courseId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(syllabusService.get(courseId, principal)));
    }

    @PutMapping("/api/syllabus")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<SyllabusDto>> upsert(
            @Valid @RequestBody UpsertSyllabusRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(syllabusService.upsert(request, principal)));
    }

    // ----- Student consumption -------------------------------------------------------

    @GetMapping("/api/syllabus/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<SyllabusDto>> mySyllabus(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(syllabusService.getForStudent(principal)));
    }
}
