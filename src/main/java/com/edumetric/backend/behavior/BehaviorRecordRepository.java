package com.edumetric.backend.behavior;

import com.edumetric.backend.behavior.domain.BehaviorRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BehaviorRecordRepository extends JpaRepository<BehaviorRecord, Long> {

    List<BehaviorRecord> findAllByStudentId(Long studentId);
}
