package com.edumetric.backend.gradecategories;

import com.edumetric.backend.gradecategories.domain.GradeCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradeCategoryRepository extends JpaRepository<GradeCategory, Long> {

    List<GradeCategory> findAllByCourseIdOrderByPositionAscIdAsc(Long courseId);
}
