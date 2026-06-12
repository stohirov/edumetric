package com.edumetric.backend.transcripts;

import com.edumetric.backend.transcripts.domain.TermGrade;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TermGradeRepository extends JpaRepository<TermGrade, Long> {

    List<TermGrade> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);

    Optional<TermGrade> findByStudentIdAndCourseIdAndTermId(Long studentId, Long courseId, Long termId);
}
