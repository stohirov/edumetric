package com.edumetric.backend.justifications;

import com.edumetric.backend.justifications.domain.AbsenceJustification;
import com.edumetric.backend.justifications.domain.JustificationStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AbsenceJustificationRepository extends JpaRepository<AbsenceJustification, Long> {

    List<AbsenceJustification> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<AbsenceJustification> findAllByStatusOrderByCreatedAtDesc(JustificationStatus status);

    boolean existsByStudentIdAndLessonId(Long studentId, Long lessonId);
}
