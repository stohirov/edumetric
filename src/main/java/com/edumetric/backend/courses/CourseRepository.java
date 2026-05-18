package com.edumetric.backend.courses;

import com.edumetric.backend.courses.domain.Course;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {

    boolean existsByCode(String code);
}
