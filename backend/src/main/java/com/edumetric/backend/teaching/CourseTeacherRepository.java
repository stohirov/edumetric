package com.edumetric.backend.teaching;

import com.edumetric.backend.teaching.domain.CourseTeacher;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseTeacherRepository extends JpaRepository<CourseTeacher, Long> {

    List<CourseTeacher> findAllByCourseId(Long courseId);

    boolean existsByCourseIdAndTeacherId(Long courseId, Long teacherId);

    Optional<CourseTeacher> findByCourseIdAndTeacherId(Long courseId, Long teacherId);
}
