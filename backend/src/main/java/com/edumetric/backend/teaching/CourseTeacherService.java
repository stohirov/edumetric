package com.edumetric.backend.teaching;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.teachers.TeacherRepository;
import com.edumetric.backend.teachers.domain.Teacher;
import com.edumetric.backend.teaching.domain.CourseTeacher;
import com.edumetric.backend.teaching.dto.AssignTeacherRequest;
import com.edumetric.backend.teaching.dto.CourseTeacherDto;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseTeacherService {

    private final CourseTeacherRepository courseTeacherRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<CourseTeacherDto> list(Long courseId) {
        if (!courseRepository.existsById(courseId)) {
            throw ResourceNotFoundException.of("Course", courseId);
        }
        return courseTeacherRepository.findAllByCourseId(courseId).stream()
                .map(CourseTeacherDto::from)
                .toList();
    }

    @Transactional
    public CourseTeacherDto assign(AssignTeacherRequest request, Long actorUserId) {
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> ResourceNotFoundException.of("Course", request.courseId()));
        Teacher teacher = teacherRepository.findById(request.teacherId())
                .orElseThrow(() -> ResourceNotFoundException.of("Teacher", request.teacherId()));

        if (courseTeacherRepository.existsByCourseIdAndTeacherId(course.getId(), teacher.getId())) {
            throw new ConflictException(
                    "Teacher " + teacher.getId() + " is already assigned to course " + course.getId());
        }

        CourseTeacher courseTeacher = courseTeacherRepository.save(CourseTeacher.builder()
                .course(course)
                .teacher(teacher)
                .assignmentRole(request.roleOrDefault())
                .createdAt(Instant.now())
                .build());

        auditLogService.log("CourseTeacher", courseTeacher.getId(), "COURSE_TEACHER_ASSIGN", actorUserId,
                Map.of(
                        "courseId", course.getId(),
                        "teacherId", teacher.getId(),
                        "assignmentRole", courseTeacher.getAssignmentRole().name()));

        return CourseTeacherDto.from(courseTeacher);
    }

    @Transactional
    public void unassign(Long courseId, Long teacherId, Long actorUserId) {
        CourseTeacher courseTeacher = courseTeacherRepository
                .findByCourseIdAndTeacherId(courseId, teacherId)
                .orElseThrow(() -> ResourceNotFoundException.of(
                        "CourseTeacher", "course=" + courseId + ", teacher=" + teacherId));

        courseTeacherRepository.delete(courseTeacher);

        auditLogService.log("CourseTeacher", courseTeacher.getId(), "COURSE_TEACHER_UNASSIGN", actorUserId,
                Map.of(
                        "courseId", courseId,
                        "teacherId", teacherId));
    }
}
