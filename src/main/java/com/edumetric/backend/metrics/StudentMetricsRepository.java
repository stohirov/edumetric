package com.edumetric.backend.metrics;

import com.edumetric.backend.metrics.domain.StudentMetrics;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentMetricsRepository extends JpaRepository<StudentMetrics, Long> {

    Optional<StudentMetrics> findByStudentId(Long studentId);

    @Query("""
            SELECT sm FROM StudentMetrics sm
            WHERE sm.student.group.id = :groupId
              AND sm.compositeScore IS NOT NULL
            """)
    List<StudentMetrics> findAllByGroupId(@Param("groupId") Long groupId);

    @Query("""
            SELECT COUNT(sm) FROM StudentMetrics sm
            WHERE sm.student.group.id = :groupId
              AND sm.compositeScore IS NOT NULL
              AND sm.compositeScore < :score
            """)
    long countInGroupBelow(@Param("groupId") Long groupId, @Param("score") BigDecimal score);

    @Query("""
            SELECT COUNT(sm) FROM StudentMetrics sm
            WHERE sm.student.group.id = :groupId
              AND sm.compositeScore IS NOT NULL
            """)
    long countInGroup(@Param("groupId") Long groupId);

    @Query("SELECT AVG(sm.compositeScore) FROM StudentMetrics sm WHERE sm.compositeScore IS NOT NULL")
    Double averageCompositeScore();

    @Query("""
            SELECT COUNT(sm) FROM StudentMetrics sm
            WHERE sm.compositeScore IS NOT NULL AND sm.compositeScore < 50
            """)
    long countAtRisk();

    @Query("""
            SELECT sm FROM StudentMetrics sm
            WHERE sm.compositeScore IS NOT NULL AND sm.compositeScore < 50
            """)
    List<StudentMetrics> findAllAtRisk();

    @Query("""
            SELECT sm FROM StudentMetrics sm
            WHERE sm.compositeScore IS NOT NULL
              AND sm.compositeScore < 50
              AND sm.student.group.id IN :groupIds
            """)
    List<StudentMetrics> findAtRiskInGroups(@Param("groupIds") List<Long> groupIds);

    List<StudentMetrics> findAllByStudentGroupId(Long groupId);

    @Query("""
            SELECT sm FROM StudentMetrics sm
            WHERE sm.student.group.id IN :groupIds
              AND sm.compositeScore IS NOT NULL
            """)
    List<StudentMetrics> findAllByStudentGroupIdIn(@Param("groupIds") List<Long> groupIds);
}
