package com.edumetric.backend.groups;

import com.edumetric.backend.groups.domain.Group;
import java.util.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query("SELECT g FROM Group g WHERE g.id IN :ids")
    Page<Group> findAllByIdIn(@Param("ids") Collection<Long> ids, Pageable pageable);
}
