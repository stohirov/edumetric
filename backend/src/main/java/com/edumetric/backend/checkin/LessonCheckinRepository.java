package com.edumetric.backend.checkin;

import com.edumetric.backend.checkin.domain.LessonCheckin;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonCheckinRepository extends JpaRepository<LessonCheckin, Long> {

    Optional<LessonCheckin> findByLessonId(Long lessonId);

    Optional<LessonCheckin> findByCode(String code);
}
