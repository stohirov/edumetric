package com.edumetric.backend.content;

import com.edumetric.backend.content.domain.MaterialVersion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialVersionRepository extends JpaRepository<MaterialVersion, Long> {

    List<MaterialVersion> findAllByMaterialIdOrderByVersionNoDesc(Long materialId);

    Page<MaterialVersion> findAllByMaterialIdOrderByVersionNoDesc(Long materialId, Pageable pageable);

    int countByMaterialId(Long materialId);

    Optional<MaterialVersion> findByIdAndMaterialId(Long id, Long materialId);
}
