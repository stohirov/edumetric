package com.edumetric.backend.groups;

import com.edumetric.backend.groups.domain.Group;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, Long> {
}
