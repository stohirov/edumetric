package com.edumetric.backend.grades;

import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.grades.domain.Assignment;
import com.edumetric.backend.grades.dto.AssignmentDto;
import com.edumetric.backend.grades.dto.CreateAssignmentRequest;
import com.edumetric.backend.grades.dto.UpdateAssignmentRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CRUD for {@link Assignment}s. Assignments are the shared origin of both grades
 * and homework submissions, so teachers create them per course they teach.
 */
@Service
@RequiredArgsConstructor
public class AssignmentService {

    private static final BigDecimal DEFAULT_WEIGHT = BigDecimal.ONE;

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final TeacherScope teacherScope;

    @Transactional(readOnly = true)
    public Page<AssignmentDto> listByCourse(Long courseId, AuthenticatedUser actor, Pageable pageable) {
        teacherScope.assertTeachesCourse(actor, courseId);
        return assignmentRepository.findAllByCourseIdOrderByDueDateAscNameAsc(courseId, pageable)
                .map(AssignmentDto::from);
    }

    @Transactional
    public AssignmentDto create(CreateAssignmentRequest request, AuthenticatedUser actor) {
        teacherScope.assertTeachesCourse(actor, request.courseId());
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> ResourceNotFoundException.of("Course", request.courseId()));
        Assignment assignment = Assignment.builder()
                .course(course)
                .name(request.name().trim())
                .type(request.type())
                .maxValue(request.maxValue())
                .weight(request.weight() != null ? request.weight() : DEFAULT_WEIGHT)
                .dueDate(request.dueDate())
                .categoryId(request.categoryId())
                .build();
        return AssignmentDto.from(assignmentRepository.save(assignment));
    }

    @Transactional
    public AssignmentDto update(Long id, UpdateAssignmentRequest request, AuthenticatedUser actor) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", id));
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());
        if (request.name() != null && !request.name().isBlank()) {
            assignment.setName(request.name().trim());
        }
        if (request.type() != null) {
            assignment.setType(request.type());
        }
        if (request.maxValue() != null) {
            assignment.setMaxValue(request.maxValue());
        }
        if (request.weight() != null) {
            assignment.setWeight(request.weight());
        }
        if (request.dueDate() != null) {
            assignment.setDueDate(request.dueDate());
        }
        if (request.categoryId() != null) {
            assignment.setCategoryId(request.categoryId() == 0 ? null : request.categoryId());
        }
        return AssignmentDto.from(assignment);
    }

    @Transactional
    public void delete(Long id, AuthenticatedUser actor) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Assignment", id));
        teacherScope.assertTeachesCourse(actor, assignment.getCourse().getId());
        assignmentRepository.delete(assignment);
    }
}
