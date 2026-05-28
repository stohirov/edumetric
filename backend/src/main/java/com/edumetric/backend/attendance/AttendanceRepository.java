package com.edumetric.backend.attendance;

import com.edumetric.backend.attendance.domain.Attendance;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findAllByLessonId(Long lessonId);

    List<Attendance> findAllByStudentId(Long studentId);

    List<Attendance> findTop10ByStudentIdOrderByMarkedAtDesc(Long studentId);

    Optional<Attendance> findByStudentIdAndLessonId(Long studentId, Long lessonId);

    List<Attendance> findAllByMarkedAtAfter(Instant from);
}
