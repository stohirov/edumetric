package com.edumetric.backend.rubrics;

import com.edumetric.backend.rubrics.domain.RubricScore;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RubricScoreRepository extends JpaRepository<RubricScore, Long> {

    @Query("""
            SELECT s FROM RubricScore s
            WHERE s.criterion.rubric.id = :rubricId
              AND s.student.id = :studentId
            ORDER BY s.criterion.position ASC, s.criterion.id ASC
            """)
    List<RubricScore> findAllByRubricIdAndStudentId(
            @Param("rubricId") Long rubricId, @Param("studentId") Long studentId);

    @Query("""
            SELECT s FROM RubricScore s
            WHERE s.criterion.id IN :criterionIds
            """)
    List<RubricScore> findAllByCriterionIdIn(@Param("criterionIds") Collection<Long> criterionIds);

    @Query("""
            SELECT s FROM RubricScore s
            WHERE s.criterion.id = :criterionId
              AND s.student.id = :studentId
            """)
    Optional<RubricScore> findByCriterionIdAndStudentId(
            @Param("criterionId") Long criterionId, @Param("studentId") Long studentId);

    @Modifying
    @Query("""
            DELETE FROM RubricScore s
            WHERE s.criterion.id IN :criterionIds
            """)
    void deleteAllByCriterionIdIn(@Param("criterionIds") Collection<Long> criterionIds);
}
