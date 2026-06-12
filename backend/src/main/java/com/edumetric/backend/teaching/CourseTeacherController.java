package com.edumetric.backend.teaching;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.teaching.dto.AssignTeacherRequest;
import com.edumetric.backend.teaching.dto.CourseTeacherDto;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/course-teachers")
@RequiredArgsConstructor
public class CourseTeacherController {

    private final CourseTeacherService courseTeacherService;

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<CourseTeacherDto>>> list(@RequestParam Long courseId) {
        return ResponseEntity.ok(ApiResponse.ok(courseTeacherService.list(courseId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseTeacherDto>> assign(
            @Valid @RequestBody AssignTeacherRequest request,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        return ResponseEntity.ok(ApiResponse.ok(courseTeacherService.assign(request, actor.id())));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> unassign(
            @RequestParam Long courseId,
            @RequestParam Long teacherId,
            @AuthenticationPrincipal AuthenticatedUser actor) {
        courseTeacherService.unassign(courseId, teacherId, actor.id());
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
