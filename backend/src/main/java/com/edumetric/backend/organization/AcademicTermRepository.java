package com.edumetric.backend.organization;

import com.edumetric.backend.organization.domain.AcademicTerm;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicTermRepository extends JpaRepository<AcademicTerm, Long> {

    List<AcademicTerm> findAllByCurrentTrue();
}
