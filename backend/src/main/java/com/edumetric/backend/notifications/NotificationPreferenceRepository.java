package com.edumetric.backend.notifications;

import com.edumetric.backend.notifications.domain.NotificationPreference;
import com.edumetric.backend.notifications.domain.NotificationType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {

    List<NotificationPreference> findAllByUserId(Long userId);

    Optional<NotificationPreference> findByUserIdAndEventType(Long userId, NotificationType eventType);
}
