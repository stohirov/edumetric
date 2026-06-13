package com.edumetric.backend.students;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.students.dto.CreateStudentRequest;
import com.edumetric.backend.students.dto.StudentDashboardDto;
import com.edumetric.backend.students.dto.StudentDto;
import com.edumetric.backend.students.dto.UpdateStudentRequest;
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
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final StudentDashboardService studentDashboardService;

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<PageResponse<StudentDto>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(studentService.list(pageable))));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentDto>> me(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.getByUserId(user.id())));
    }

    @GetMapping("/me/dashboard")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentDashboardDto>> myDashboard(
            @AuthenticationPrincipal AuthenticatedUser user) {
        Long studentId = studentService.getIdByUserId(user.id());
        return ResponseEntity.ok(ApiResponse.ok(studentDashboardService.dashboard(studentId)));
    }

    @GetMapping("/{id}/dashboard")
    @PreAuthorize("hasRole('TEACHER') or @studentSelfScope.isSelf(authentication.principal, #id)")
    public ResponseEntity<ApiResponse<StudentDashboardDto>> dashboard(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(studentDashboardService.dashboard(id)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER') or @studentSelfScope.isSelf(authentication.principal, #id)")
    public ResponseEntity<ApiResponse<StudentDto>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.get(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDto>> create(@Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.create(request)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDto>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateStudentRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(studentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        studentService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
