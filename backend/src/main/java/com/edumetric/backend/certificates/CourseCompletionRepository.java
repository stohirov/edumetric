package com.edumetric.backend.certificates;

import com.edumetric.backend.certificates.domain.CourseCompletion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseCompletionRepository extends JpaRepository<CourseCompletion, Long> {

    List<CourseCompletion> findAllByStudentId(Long studentId);

    Page<CourseCompletion> findAllByStudentId(Long studentId, Pageable pageable);

    Optional<CourseCompletion> findByStudentIdAndCourseId(Long studentId, Long courseId);

    Optional<CourseCompletion> findByCertificateCode(String certificateCode);
}
