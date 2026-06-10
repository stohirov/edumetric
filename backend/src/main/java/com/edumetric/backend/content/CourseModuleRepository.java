package com.edumetric.backend.content;

import com.edumetric.backend.content.domain.CourseModule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {

    List<CourseModule> findAllByCourseIdOrderByPositionAscIdAsc(Long courseId);

    List<CourseModule> findAllByCourseIdAndPublishedTrueOrderByPositionAscIdAsc(Long courseId);
}
