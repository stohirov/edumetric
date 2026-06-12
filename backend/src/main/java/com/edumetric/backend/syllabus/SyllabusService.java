package com.edumetric.backend.syllabus;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.courses.CourseRepository;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.TeacherScope;
import com.edumetric.backend.students.StudentRepository;
import com.edumetric.backend.students.domain.Student;
import com.edumetric.backend.syllabus.domain.Syllabus;
import com.edumetric.backend.syllabus.dto.SyllabusDto;
import com.edumetric.backend.syllabus.dto.UpsertSyllabusRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authoring and consumption of a per-course syllabus. Teachers/admins author the
 * syllabus for courses they own; students read the published syllabus of their
 * own course.
 */
@Service
@RequiredArgsConstructor
public class SyllabusService {

    private final SyllabusRepository syllabusRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final TeacherScope teacherScope;
    private final AuditLogService auditLogService;

    // ----- Teacher / admin authoring -------------------------------------------------

    @Transactional(readOnly = true)
    public SyllabusDto get(Long courseId, AuthenticatedUser actor) {
        teacherScope.assertTeachesCourse(actor, courseId);
        return syllabusRepository.findByCourseId(courseId)
                .map(SyllabusDto::from)
                .orElseGet(() -> emptyFor(loadCourse(courseId)));
    }

    @Transactional
    public SyllabusDto upsert(UpsertSyllabusRequest request, AuthenticatedUser actor) {
        teacherScope.assertTeachesCourse(actor, request.courseId());
        Syllabus syllabus = syllabusRepository.findByCourseId(request.courseId())
                .orElseGet(() -> Syllabus.builder()
                        .course(loadCourse(request.courseId()))
                        .build());
        syllabus.setObjectives(trimToNull(request.objectives()));
        syllabus.setOutline(trimToNull(request.outline()));
        syllabus.setPublished(Boolean.TRUE.equals(request.published()));
        Syllabus saved = syllabusRepository.save(syllabus);
        auditLogService.log("Syllabus", saved.getId(), "SYLLABUS_UPSERT", actor.id(),
                SyllabusDto.from(saved));
        return SyllabusDto.from(saved);
    }

    // ----- Student consumption -------------------------------------------------------

    @Transactional(readOnly = true)
    public SyllabusDto getForStudent(AuthenticatedUser actor) {
        Student student = studentRepository.findByUserId(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("Student", actor.id()));
        if (student.getGroup() == null || student.getGroup().getCourse() == null) {
            throw new ResourceNotFoundException("No course assigned");
        }
        Long courseId = student.getGroup().getCourse().getId();
        Syllabus syllabus = syllabusRepository.findByCourseId(courseId)
                .filter(Syllabus::isPublished)
                .orElseThrow(() -> new ResourceNotFoundException("No published syllabus for course " + courseId));
        return SyllabusDto.from(syllabus);
    }

    // ----- Helpers -------------------------------------------------------------------

    private Course loadCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> ResourceNotFoundException.of("Course", courseId));
    }

    private static SyllabusDto emptyFor(Course course) {
        return new SyllabusDto(null, course.getId(), course.getName(), null, null, false);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
