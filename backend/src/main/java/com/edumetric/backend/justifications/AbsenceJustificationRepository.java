package com.edumetric.backend.justifications;

import com.edumetric.backend.justifications.domain.AbsenceJustification;
import com.edumetric.backend.justifications.domain.JustificationStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AbsenceJustificationRepository extends JpaRepository<AbsenceJustification, Long> {

    List<AbsenceJustification> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);

    Page<AbsenceJustification> findAllByStudentIdOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    List<AbsenceJustification> findAllByStatusOrderByCreatedAtDesc(JustificationStatus status);

    Page<AbsenceJustification> findAllByStatusOrderByCreatedAtDesc(
            JustificationStatus status, Pageable pageable);

    /** Pending justifications scoped to the courses a teacher teaches — scope pushed into the query. */
    @Query("""
            SELECT j FROM AbsenceJustification j
            WHERE j.lesson.course.id IN :courseIds
              AND j.status = :status
            ORDER BY j.createdAt DESC
            """)
    Page<AbsenceJustification> findAllByCourseIdsAndStatus(
            @Param("courseIds") Collection<Long> courseIds,
            @Param("status") JustificationStatus status,
            Pageable pageable);

    boolean existsByStudentIdAndLessonId(Long studentId, Long lessonId);
}
