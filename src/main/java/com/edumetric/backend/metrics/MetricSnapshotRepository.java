package com.edumetric.backend.metrics;

import com.edumetric.backend.metrics.domain.MetricSnapshot;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MetricSnapshotRepository extends JpaRepository<MetricSnapshot, Long> {

    List<MetricSnapshot> findAllByStudentIdOrderBySnapshotDateAsc(Long studentId);

    List<MetricSnapshot> findTop12ByStudentIdOrderBySnapshotDateDesc(Long studentId);

    Optional<MetricSnapshot> findByStudentIdAndSnapshotDate(Long studentId, LocalDate snapshotDate);

    List<MetricSnapshot> findAllBySnapshotDateGreaterThanEqualOrderBySnapshotDateAsc(LocalDate from);
}
