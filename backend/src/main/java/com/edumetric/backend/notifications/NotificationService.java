package com.edumetric.backend.notifications;

import com.edumetric.backend.notifications.domain.Notification;
import com.edumetric.backend.notifications.domain.NotificationType;
import com.edumetric.backend.notifications.dto.NotificationDto;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Produces and serves in-app notifications. The {@code notify*} methods are the reusable
 * entry point other slices call to raise a notification (they honour the recipient's
 * {@code notifyInApp} preference); the read methods back the notification-center UI.
 */
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /** Raise a notification for a single user (no-op if the user opted out of in-app notifications). */
    @Transactional
    public void notifyUser(Long userId, NotificationType type, String title, String body, String link) {
        if (userId == null) {
            return;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || !user.isNotifyInApp()) {
            return;
        }
        notificationRepository.save(build(user, type, title, body, link));
    }

    /** Fan a notification out to many users in one batch, skipping those who opted out. */
    @Transactional
    public void notifyUsers(
            Collection<Long> userIds, NotificationType type, String title, String body, String link) {
        if (userIds == null || userIds.isEmpty()) {
            return;
        }
        List<Notification> batch = new ArrayList<>();
        for (User user : userRepository.findAllById(userIds)) {
            if (user.isNotifyInApp()) {
                batch.add(build(user, type, title, body, link));
            }
        }
        if (!batch.isEmpty()) {
            notificationRepository.saveAll(batch);
        }
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> list(AuthenticatedUser actor) {
        return notificationRepository.findTop50ByUserIdOrderByCreatedAtDesc(actor.id()).stream()
                .map(NotificationDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(AuthenticatedUser actor) {
        return notificationRepository.countByUserIdAndReadAtIsNull(actor.id());
    }

    @Transactional
    public void markRead(Long id, AuthenticatedUser actor) {
        notificationRepository.markRead(id, actor.id(), Instant.now());
    }

    @Transactional
    public void markAllRead(AuthenticatedUser actor) {
        notificationRepository.markAllRead(actor.id(), Instant.now());
    }

    private Notification build(User user, NotificationType type, String title, String body, String link) {
        return Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .body(body)
                .link(link)
                .build();
    }
}
