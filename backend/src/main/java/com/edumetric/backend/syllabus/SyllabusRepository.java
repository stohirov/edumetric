package com.edumetric.backend.syllabus;

import com.edumetric.backend.syllabus.domain.Syllabus;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {

    Optional<Syllabus> findByCourseId(Long courseId);
}
