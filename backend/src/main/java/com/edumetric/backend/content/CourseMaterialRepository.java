package com.edumetric.backend.content;

import com.edumetric.backend.content.domain.CourseMaterial;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {

    List<CourseMaterial> findAllByModuleIdOrderByPositionAscIdAsc(Long moduleId);

    List<CourseMaterial> findAllByModuleIdAndPublishedTrueOrderByPositionAscIdAsc(Long moduleId);

    @Query("""
            select m from CourseMaterial m
            where m.module.course.id = :courseId
              and m.published = true
              and m.module.published = true
            order by m.module.position asc, m.position asc, m.id asc
            """)
    List<CourseMaterial> findPublishedByCourse(Long courseId);
}
