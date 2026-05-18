package com.edumetric.backend.users;

import com.edumetric.backend.auth.dto.UserDto;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.dto.CreateUserRequest;
import jakarta.validation.Valid;
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
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> list(
            @RequestParam(required = false) Role role, Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(userService.list(role, pageable))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> create(
            @Valid @RequestBody CreateUserRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(userService.create(request, actor)));
    }
}
