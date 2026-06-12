package com.edumetric.backend.appeals;

import com.edumetric.backend.appeals.domain.AppealStatus;
import com.edumetric.backend.appeals.domain.GradeAppeal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GradeAppealRepository extends JpaRepository<GradeAppeal, Long> {

    List<GradeAppeal> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<GradeAppeal> findAllByStatusOrderByCreatedAtDesc(AppealStatus status);

    @Query("""
            SELECT a FROM GradeAppeal a
            WHERE a.assignment.course.id = :courseId
              AND a.status = :status
            ORDER BY a.createdAt DESC
            """)
    List<GradeAppeal> findAllByAssignment_Course_IdAndStatus(
            @Param("courseId") Long courseId, @Param("status") AppealStatus status);
}
