package com.edumetric.backend.teachers;

import com.edumetric.backend.common.api.ApiResponse;
import com.edumetric.backend.common.api.PageResponse;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.groups.dto.GroupDto;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.students.dto.StudentDto;
import com.edumetric.backend.teachers.dto.CreateTeacherRequest;
import com.edumetric.backend.teachers.dto.TeacherDto;
import com.edumetric.backend.teachers.dto.UpdateTeacherRequest;
import java.util.List;
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
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final TeacherRepository teacherRepository;

    @GetMapping
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<PageResponse<TeacherDto>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(PageResponse.of(teacherService.list(pageable))));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<TeacherDto>> me(@AuthenticationPrincipal AuthenticatedUser user) {
        TeacherDto dto = teacherRepository.findByUserId(user.id())
                .map(TeacherDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("Teacher (for user)", user.id()));
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }

    @GetMapping("/me/students")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<PageResponse<StudentDto>>> myStudents(
            @AuthenticationPrincipal AuthenticatedUser user, Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.ok(PageResponse.of(teacherService.listMyStudents(user.id(), pageable))));
    }

    @GetMapping("/me/groups")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<GroupDto>>> myGroups(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(ApiResponse.ok(teacherService.listMyGroups(user.id())));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<TeacherDto>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(teacherService.get(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDto>> create(@Valid @RequestBody CreateTeacherRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(teacherService.create(request)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TeacherDto>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateTeacherRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(teacherService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
