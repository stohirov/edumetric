package com.edumetric.backend.plagiarism;

import com.edumetric.backend.plagiarism.domain.PlagiarismReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlagiarismReportRepository extends JpaRepository<PlagiarismReport, Long> {

    Page<PlagiarismReport> findAllByAssignmentIdOrderBySimilarityDesc(
            Long assignmentId, Pageable pageable);

    void deleteAllByAssignmentId(Long assignmentId);
}
