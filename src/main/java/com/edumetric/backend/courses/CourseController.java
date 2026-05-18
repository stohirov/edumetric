package com.edumetric.backend.courses;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.courses.dto.CourseDto;
import com.edumetric.backend.courses.dto.CreateCourseRequest;
import com.edumetric.backend.courses.dto.UpdateCourseRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PageResponse<CourseDto>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(courseService.list(pageable))));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<CourseDto>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.get(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> create(@Valid @RequestBody CreateCourseRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.create(request)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CourseDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCourseRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        courseService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
