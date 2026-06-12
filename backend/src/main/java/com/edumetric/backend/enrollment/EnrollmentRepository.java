package com.edumetric.backend.enrollment;

import com.edumetric.backend.enrollment.domain.Enrollment;
import com.edumetric.backend.enrollment.domain.EnrollmentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findAllByStudentIdOrderByEnrolledAtDescCreatedAtDesc(Long studentId);

    Optional<Enrollment> findFirstByStudentIdAndStatus(Long studentId, EnrollmentStatus status);
}
