package com.edumetric.backend.users;

import com.edumetric.backend.auth.dto.UserDto;
import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.users.UserService.ProfileAvatar;
import com.edumetric.backend.users.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

/**
 * Self-service profile endpoints for the currently authenticated user.
 * Any authenticated role may read and update their own profile + preferences
 * (name, email, password, language, notification prefs, contact info, avatar) —
 * but not their role.
 */
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<UserDto>> me(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.ok(userService.get(principal.id())));
    }

    @PatchMapping
    public ResponseEntity<ApiResponse<UserDto>> update(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(
                ApiResponse.ok(userService.updateOwnProfile(principal.id(), request, principal)));
    }

    @PostMapping(path = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<UserDto>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(
                ApiResponse.ok(userService.updateAvatar(principal.id(), file, principal)));
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<ApiResponse<UserDto>> deleteAvatar(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(
                ApiResponse.ok(userService.removeAvatar(principal.id(), principal)));
    }

    @GetMapping("/avatar")
    public ResponseEntity<StreamingResponseBody> avatar(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        ProfileAvatar avatar = userService.getAvatar(principal.id());
        StreamingResponseBody body = output -> {
            try (var in = avatar.stream()) {
                in.transferTo(output);
            }
        };
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .contentType(MediaType.parseMediaType(avatar.contentType()))
                .body(body);
    }
}
