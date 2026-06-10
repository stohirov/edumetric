package com.edumetric.backend.content;

import com.edumetric.backend.content.domain.MaterialCompletion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialCompletionRepository extends JpaRepository<MaterialCompletion, Long> {

    List<MaterialCompletion> findAllByStudentId(Long studentId);

    Optional<MaterialCompletion> findByStudentIdAndMaterialId(Long studentId, Long materialId);

    void deleteAllByMaterialId(Long materialId);

    void deleteByStudentIdAndMaterialId(Long studentId, Long materialId);
}
