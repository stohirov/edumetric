package com.edumetric.backend.behavior;

import com.edumetric.backend.behavior.domain.ActivityRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRecordRepository extends JpaRepository<ActivityRecord, Long> {

    List<ActivityRecord> findAllByStudentId(Long studentId);
}
