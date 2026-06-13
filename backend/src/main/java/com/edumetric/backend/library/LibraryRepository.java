package com.edumetric.backend.library;

import com.edumetric.backend.content.domain.CourseMaterial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    @Query(value = """
            SELECT m FROM CourseMaterial m
            WHERE m.type = com.edumetric.backend.content.domain.MaterialType.FILE
              AND m.published = true
              AND m.module.published = true
              AND m.fileObjectKey IS NOT NULL
            ORDER BY m.title ASC
            """,
            countQuery = """
            SELECT COUNT(m) FROM CourseMaterial m
            WHERE m.type = com.edumetric.backend.content.domain.MaterialType.FILE
              AND m.published = true
              AND m.module.published = true
              AND m.fileObjectKey IS NOT NULL
            """)
    Page<CourseMaterial> findAllPublishedFiles(Pageable pageable);

    /** Published FILE materials (in a published module) belonging to a single course. */
    @Query(value = """
            SELECT m FROM CourseMaterial m
            WHERE m.type = com.edumetric.backend.content.domain.MaterialType.FILE
              AND m.published = true
              AND m.module.published = true
              AND m.fileObjectKey IS NOT NULL
              AND m.module.course.id = :courseId
            ORDER BY m.title ASC
            """,
            countQuery = """
            SELECT COUNT(m) FROM CourseMaterial m
            WHERE m.type = com.edumetric.backend.content.domain.MaterialType.FILE
              AND m.published = true
              AND m.module.published = true
              AND m.fileObjectKey IS NOT NULL
              AND m.module.course.id = :courseId
            """)
    Page<CourseMaterial> findPublishedFilesForCourse(@Param("courseId") Long courseId, Pageable pageable);
}
