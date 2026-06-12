package com.edumetric.backend.attendance;

import com.edumetric.backend.attendance.domain.AttendancePolicy;
import com.edumetric.backend.attendance.dto.AttendancePolicyDto;
import com.edumetric.backend.attendance.dto.UpdateAttendancePolicyRequest;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Reads and updates the institution-wide attendance policy singleton. */
@Service
@RequiredArgsConstructor
public class AttendancePolicyService {

    private final AttendancePolicyRepository repository;

    /** Returns the policy, lazily creating sensible defaults if the seed row is missing. */
    @Transactional
    public AttendancePolicy current() {
        return repository.findById(AttendancePolicy.SINGLETON_ID)
                .orElseGet(() -> repository.save(AttendancePolicy.builder()
                        .id(AttendancePolicy.SINGLETON_ID)
                        .minAttendancePercent(new BigDecimal("75.00"))
                        .consecutiveAbsenceLimit(3)
                        .notifyOnAbsence(true)
                        .updatedAt(Instant.now())
                        .build()));
    }

    @Transactional(readOnly = true)
    public AttendancePolicyDto get() {
        return AttendancePolicyDto.from(current());
    }

    @Transactional
    public AttendancePolicyDto update(UpdateAttendancePolicyRequest request) {
        AttendancePolicy policy = current();
        if (request.minAttendancePercent() != null) {
            policy.setMinAttendancePercent(request.minAttendancePercent());
        }
        if (request.consecutiveAbsenceLimit() != null) {
            policy.setConsecutiveAbsenceLimit(request.consecutiveAbsenceLimit());
        }
        if (request.notifyOnAbsence() != null) {
            policy.setNotifyOnAbsence(request.notifyOnAbsence());
        }
        policy.setUpdatedAt(Instant.now());
        return AttendancePolicyDto.from(policy);
    }
}
