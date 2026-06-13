package com.edumetric.backend.groups;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.groups.dto.CreateGroupRequest;
import com.edumetric.backend.groups.dto.GroupDto;
import com.edumetric.backend.groups.dto.UpdateGroupRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.students.dto.StudentDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<PageResponse<GroupDto>>> list(
            @AuthenticationPrincipal AuthenticatedUser actor, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(groupService.list(actor, pageable))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<GroupDto>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.get(id)));
    }

    @GetMapping("/{id}/students")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<PageResponse<StudentDto>>> students(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser actor,
            Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(groupService.listStudents(id, actor, pageable))));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GroupDto>> create(@Valid @RequestBody CreateGroupRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.create(request)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GroupDto>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateGroupRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(groupService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        groupService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
