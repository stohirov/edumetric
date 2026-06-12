package com.edumetric.backend.library;

import com.edumetric.backend.content.domain.CourseMaterial;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Read-only access to published FILE {@link CourseMaterial}s for the cross-course Resource Library.
 *
 * <p>A second repository over {@code CourseMaterial} (alongside the content slice's own) is fine in
 * Spring Data — each is just a query surface, not an entity owner.
 */
public interface LibraryRepository extends JpaRepository<CourseMaterial, Long> {

    /** Every published FILE material (in a published module) across all courses. */
    @Query("""
            SELECT m FROM CourseMaterial m
            WHERE m.type = com.edumetric.backend.content.domain.MaterialType.FILE
              AND m.published = true
              AND m.module.published = true
              AND m.fileObjectKey IS NOT NULL
            ORDER BY m.title ASC
            """)
    List<CourseMaterial> findAllPublishedFiles();

    /** Published FILE materials (in a published module) belonging to a single course. */
    @Query("""
            SELECT m FROM CourseMaterial m
            WHERE m.type = com.edumetric.backend.content.domain.MaterialType.FILE
              AND m.published = true
              AND m.module.published = true
              AND m.fileObjectKey IS NOT NULL
              AND m.module.course.id = :courseId
            ORDER BY m.title ASC
            """)
    List<CourseMaterial> findPublishedFilesForCourse(@Param("courseId") Long courseId);
}
