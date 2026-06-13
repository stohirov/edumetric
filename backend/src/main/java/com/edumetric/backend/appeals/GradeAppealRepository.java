package com.edumetric.backend.appeals;

import com.edumetric.backend.appeals.domain.AppealStatus;
import com.edumetric.backend.appeals.domain.GradeAppeal;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GradeAppealRepository extends JpaRepository<GradeAppeal, Long> {

    Page<GradeAppeal> findAllByStudentIdOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    Page<GradeAppeal> findAllByStatusOrderByCreatedAtDesc(AppealStatus status, Pageable pageable);

    @Query("""
            SELECT a FROM GradeAppeal a
            WHERE a.assignment.course.id = :courseId
              AND a.status = :status
            ORDER BY a.createdAt DESC
            """)
    List<GradeAppeal> findAllByAssignment_Course_IdAndStatus(
            @Param("courseId") Long courseId, @Param("status") AppealStatus status);

    @Query("""
            SELECT a FROM GradeAppeal a
            WHERE a.assignment.course.id IN :courseIds
              AND a.status = :status
            ORDER BY a.createdAt DESC
            """)
    Page<GradeAppeal> findAllByCourseIdsAndStatus(
            @Param("courseIds") Collection<Long> courseIds,
            @Param("status") AppealStatus status,
            Pageable pageable);
}
