package com.edumetric.backend.attendance;

import com.edumetric.backend.attendance.domain.AttendancePolicy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendancePolicyRepository extends JpaRepository<AttendancePolicy, Long> {
}
