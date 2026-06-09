package com.edumetric.backend.settings;

import com.edumetric.backend.settings.domain.InstitutionSettings;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingsRepository extends JpaRepository<InstitutionSettings, Long> {

    Optional<InstitutionSettings> findTopByOrderByIdAsc();
}
