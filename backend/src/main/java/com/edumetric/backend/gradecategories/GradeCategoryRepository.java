package com.edumetric.backend.gradecategories;

import com.edumetric.backend.gradecategories.domain.GradeCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradeCategoryRepository extends JpaRepository<GradeCategory, Long> {

    Page<GradeCategory> findAllByCourseIdOrderByPositionAscIdAsc(Long courseId, Pageable pageable);
}
