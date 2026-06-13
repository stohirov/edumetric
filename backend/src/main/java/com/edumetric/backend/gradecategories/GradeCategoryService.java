package com.edumetric.backend.gradecategories;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.gradecategories.domain.GradeCategory;
import com.edumetric.backend.gradecategories.dto.CreateGradeCategoryRequest;
import com.edumetric.backend.gradecategories.dto.GradeCategoryDto;
import com.edumetric.backend.gradecategories.dto.UpdateGradeCategoryRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CRUD for named, weighted {@link GradeCategory}s per course. Teachers manage the
 * categories for courses they teach; admins may manage any.
 */
@Service
@RequiredArgsConstructor
public class GradeCategoryService {

    private final GradeCategoryRepository gradeCategoryRepository;
    private final CourseRepository courseRepository;
    private final TeacherScope teacherScope;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<GradeCategoryDto> listByCourse(Long courseId, AuthenticatedUser actor, Pageable pageable) {
        return gradeCategoryRepository.findAllByCourseIdOrderByPositionAscIdAsc(courseId, pageable)
                .map(GradeCategoryDto::from);
    }

    @Transactional
    public GradeCategoryDto create(CreateGradeCategoryRequest request, AuthenticatedUser actor) {
        teacherScope.assertTeachesCourse(actor, request.courseId());
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> ResourceNotFoundException.of("Course", request.courseId()));
        GradeCategory category = GradeCategory.builder()
                .course(course)
                .name(request.name().trim())
                .weight(request.weight())
                .position(request.position() != null ? request.position() : 0)
                .createdAt(Instant.now())
                .build();
        GradeCategory saved = gradeCategoryRepository.save(category);
        GradeCategoryDto dto = GradeCategoryDto.from(saved);
        auditLogService.log("GradeCategory", saved.getId(), "GRADE_CATEGORY_CREATE", actor.id(), dto);
        return dto;
    }

    @Transactional
    public GradeCategoryDto update(Long id, UpdateGradeCategoryRequest request, AuthenticatedUser actor) {
        GradeCategory category = gradeCategoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("GradeCategory", id));
        teacherScope.assertTeachesCourse(actor, category.getCourse().getId());
        if (request.name() != null && !request.name().isBlank()) {
            category.setName(request.name().trim());
        }
        if (request.weight() != null) {
            category.setWeight(request.weight());
        }
        if (request.position() != null) {
            category.setPosition(request.position());
        }
        GradeCategoryDto dto = GradeCategoryDto.from(category);
        auditLogService.log("GradeCategory", category.getId(), "GRADE_CATEGORY_UPDATE", actor.id(), dto);
        return dto;
    }

    @Transactional
    public void delete(Long id, AuthenticatedUser actor) {
        GradeCategory category = gradeCategoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("GradeCategory", id));
        teacherScope.assertTeachesCourse(actor, category.getCourse().getId());
        gradeCategoryRepository.delete(category);
        auditLogService.log("GradeCategory", id, "GRADE_CATEGORY_DELETE", actor.id(), null);
    }
}
