package com.edumetric.backend.catalog;

import com.edumetric.backend.catalog.domain.EnrollmentRequest;
import com.edumetric.backend.catalog.domain.EnrollmentRequestStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRequestRepository extends JpaRepository<EnrollmentRequest, Long> {

    List<EnrollmentRequest> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);

    Page<EnrollmentRequest> findAllByStudentIdOrderByCreatedAtDesc(Long studentId, Pageable pageable);

    List<EnrollmentRequest> findAllByStatusOrderByCreatedAtDesc(EnrollmentRequestStatus status);

    Page<EnrollmentRequest> findAllByStatusOrderByCreatedAtDesc(
            EnrollmentRequestStatus status, Pageable pageable);

    boolean existsByStudentIdAndGroupIdAndStatus(
            Long studentId, Long groupId, EnrollmentRequestStatus status);
}
