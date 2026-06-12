package com.edumetric.backend.catalog;

import com.edumetric.backend.catalog.domain.EnrollmentRequest;
import com.edumetric.backend.catalog.domain.EnrollmentRequestStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRequestRepository extends JpaRepository<EnrollmentRequest, Long> {

    List<EnrollmentRequest> findAllByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<EnrollmentRequest> findAllByStatusOrderByCreatedAtDesc(EnrollmentRequestStatus status);

    boolean existsByStudentIdAndGroupIdAndStatus(
            Long studentId, Long groupId, EnrollmentRequestStatus status);
}
