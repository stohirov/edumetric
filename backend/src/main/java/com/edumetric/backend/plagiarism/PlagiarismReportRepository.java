package com.edumetric.backend.plagiarism;

import com.edumetric.backend.plagiarism.domain.PlagiarismReport;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlagiarismReportRepository extends JpaRepository<PlagiarismReport, Long> {

    List<PlagiarismReport> findAllByAssignmentIdOrderBySimilarityDesc(Long assignmentId);

    void deleteAllByAssignmentId(Long assignmentId);
}
