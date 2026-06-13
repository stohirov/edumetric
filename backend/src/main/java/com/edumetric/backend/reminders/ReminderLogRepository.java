package com.edumetric.backend.reminders;

import com.edumetric.backend.reminders.domain.ReminderLog;
import com.edumetric.backend.reminders.domain.ReminderType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderLogRepository extends JpaRepository<ReminderLog, Long> {

    boolean existsByReminderTypeAndRefIdAndUserId(ReminderType reminderType, Long refId, Long userId);
}
