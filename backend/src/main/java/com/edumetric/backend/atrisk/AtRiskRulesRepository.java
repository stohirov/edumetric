package com.edumetric.backend.atrisk;

import com.edumetric.backend.atrisk.domain.AtRiskRules;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AtRiskRulesRepository extends JpaRepository<AtRiskRules, Long> {

    Optional<AtRiskRules> findTopByOrderByIdAsc();
}
