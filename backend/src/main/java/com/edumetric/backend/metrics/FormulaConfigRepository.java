package com.edumetric.backend.metrics;

import com.edumetric.backend.metrics.domain.FormulaConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormulaConfigRepository extends JpaRepository<FormulaConfig, Long> {

    Optional<FormulaConfig> findFirstByActiveTrueOrderByCreatedAtDesc();
}
