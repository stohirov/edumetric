package com.edumetric.backend.parents;

import com.edumetric.backend.parents.domain.ParentLink;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParentLinkRepository extends JpaRepository<ParentLink, Long> {

    @Query("SELECT pl FROM ParentLink pl WHERE pl.parent.id = :parentUserId")
    List<ParentLink> findAllByParentUserId(@Param("parentUserId") Long parentUserId);

    @Query("SELECT pl FROM ParentLink pl WHERE pl.student.id = :studentId")
    List<ParentLink> findAllByStudentId(@Param("studentId") Long studentId);

    @Query("""
            SELECT CASE WHEN COUNT(pl) > 0 THEN true ELSE false END
            FROM ParentLink pl
            WHERE pl.parent.id = :parentUserId AND pl.student.id = :studentId
            """)
    boolean existsByParentUserIdAndStudentId(
            @Param("parentUserId") Long parentUserId, @Param("studentId") Long studentId);
}
