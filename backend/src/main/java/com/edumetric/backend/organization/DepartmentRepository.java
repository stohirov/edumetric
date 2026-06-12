package com.edumetric.backend.organization;

import com.edumetric.backend.organization.domain.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByCode(String code);
}
