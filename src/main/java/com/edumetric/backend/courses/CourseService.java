package com.edumetric.backend.courses;

import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.courses.domain.Course;
import com.edumetric.backend.courses.dto.CourseDto;
import com.edumetric.backend.courses.dto.CreateCourseRequest;
import com.edumetric.backend.courses.dto.UpdateCourseRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public Page<CourseDto> list(Pageable pageable) {
        return courseRepository.findAll(pageable).map(CourseDto::from);
    }

    @Transactional(readOnly = true)
    public CourseDto get(Long id) {
        return courseRepository.findById(id).map(CourseDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("Course", id));
    }

    @Transactional
    public CourseDto create(CreateCourseRequest request) {
        if (courseRepository.existsByCode(request.code())) {
            throw new ConflictException("Course code already exists: " + request.code());
        }
        Course course = Course.builder()
                .name(request.name())
                .code(request.code())
                .description(request.description())
                .build();
        return CourseDto.from(courseRepository.save(course));
    }

    @Transactional
    public CourseDto update(Long id, UpdateCourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Course", id));
        if (StringUtils.hasText(request.name())) {
            course.setName(request.name());
        }
        if (StringUtils.hasText(request.code()) && !request.code().equals(course.getCode())) {
            if (courseRepository.existsByCode(request.code())) {
                throw new ConflictException("Course code already exists: " + request.code());
            }
            course.setCode(request.code());
        }
        if (request.description() != null) {
            course.setDescription(request.description());
        }
        return CourseDto.from(course);
    }

    @Transactional
    public void delete(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Course", id));
        courseRepository.delete(course);
    }
}
