package com.edumetric.backend.library;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.library.dto.LibraryItemDto;
import com.edumetric.backend.security.AuthenticatedUser;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Cross-course Resource Library: a flat, searchable list of downloadable FILE materials. */
@RestController
@RequiredArgsConstructor
public class LibraryController {

    private final LibraryService libraryService;

    @GetMapping("/api/library")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<LibraryItemDto>>> list(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(libraryService.listFor(principal)));
    }
}
