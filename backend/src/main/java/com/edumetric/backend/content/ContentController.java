package com.edumetric.backend.content;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.content.ContentService.DownloadedFile;
import com.edumetric.backend.content.dto.CourseContentDto;
import com.edumetric.backend.content.dto.CreateMaterialRequest;
import com.edumetric.backend.content.dto.CreateModuleRequest;
import com.edumetric.backend.content.dto.MaterialDto;
import com.edumetric.backend.content.dto.ModuleDto;
import com.edumetric.backend.content.dto.UpdateMaterialRequest;
import com.edumetric.backend.content.dto.UpdateModuleRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

/** Course content: module/material authoring (teacher) and curriculum consumption (student). */
@RestController
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    // ----- Teacher / admin authoring -------------------------------------------------

    @GetMapping("/api/modules")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ModuleDto>>> listModules(
            @RequestParam Long courseId,
            @AuthenticationPrincipal AuthenticatedUser principal, Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(contentService.listModules(courseId, principal, pageable))));
    }

    @PostMapping("/api/modules")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ModuleDto>> createModule(
            @Valid @RequestBody CreateModuleRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(contentService.createModule(request, principal)));
    }

    @PatchMapping("/api/modules/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ModuleDto>> updateModule(
            @PathVariable Long id,
            @Valid @RequestBody UpdateModuleRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(contentService.updateModule(id, request, principal)));
    }

    @DeleteMapping("/api/modules/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteModule(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        contentService.deleteModule(id, principal);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/api/modules/{moduleId}/materials")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaterialDto>> createMaterial(
            @PathVariable Long moduleId,
            @Valid @RequestBody CreateMaterialRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(contentService.createMaterial(moduleId, request, principal)));
    }

    @PatchMapping("/api/materials/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaterialDto>> updateMaterial(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMaterialRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(contentService.updateMaterial(id, request, principal)));
    }

    @DeleteMapping("/api/materials/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMaterial(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        contentService.deleteMaterial(id, principal);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping(path = "/api/materials/{id}/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaterialDto>> uploadMaterialFile(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(contentService.uploadMaterialFile(id, file, principal)));
    }

    @GetMapping("/api/materials/{id}/file")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<StreamingResponseBody> downloadMaterialFile(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return streamFile(contentService.downloadForTeacher(id, principal));
    }

    @GetMapping("/api/materials/{id}/versions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<com.edumetric.backend.content.dto.MaterialVersionDto>>> listVersions(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal, Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(contentService.listVersions(id, principal, pageable))));
    }

    @PostMapping("/api/materials/{id}/versions/{versionId}/restore")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<ApiResponse<MaterialDto>> restoreVersion(
            @PathVariable Long id,
            @PathVariable Long versionId,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(contentService.restoreVersion(id, versionId, principal)));
    }

    // ----- Student consumption -------------------------------------------------------

    @GetMapping("/api/content/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<CourseContentDto>> myContent(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(contentService.getContentForStudent(principal)));
    }

    @PostMapping("/api/content/materials/{id}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> markComplete(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        contentService.markComplete(id, principal);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @DeleteMapping("/api/content/materials/{id}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> unmarkComplete(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        contentService.unmarkComplete(id, principal);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/api/content/materials/{id}/file")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StreamingResponseBody> downloadStudentFile(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return streamFile(contentService.downloadForStudent(id, principal));
    }

    private static ResponseEntity<StreamingResponseBody> streamFile(DownloadedFile file) {
        MediaType mediaType = file.contentType() != null
                ? MediaType.parseMediaType(file.contentType())
                : MediaType.APPLICATION_OCTET_STREAM;
        StreamingResponseBody body = output -> {
            try (var in = file.stream()) {
                in.transferTo(output);
            }
        };
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + file.fileName() + "\"")
                .contentType(mediaType)
                .body(body);
    }
}
