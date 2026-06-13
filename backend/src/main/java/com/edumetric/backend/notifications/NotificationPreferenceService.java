package com.edumetric.backend.notifications;

import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.notifications.domain.NotificationPreference;
import com.edumetric.backend.notifications.domain.NotificationType;
import com.edumetric.backend.notifications.dto.NotificationPreferenceDto;
import com.edumetric.backend.notifications.dto.UpdateNotificationPreferenceRequest;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.users.UserRepository;
import com.edumetric.backend.users.domain.User;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Resolves the per-event in-app/email channel choice for a user, and backs the preferences UI.
 * The global {@code users.notify_in_app}/{@code notify_email} switches are master toggles — a
 * per-event row can only further narrow them, never override an opt-out.
 */
@Service
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    /** Whether an in-app notification of {@code type} should reach {@code user}. */
    public boolean inAppEnabled(User user, NotificationType type) {
        if (!user.isNotifyInApp()) {
            return false;
        }
        return preferenceRepository.findByUserIdAndEventType(user.getId(), type)
                .map(NotificationPreference::isInApp)
                .orElse(true);
    }

    /** Whether an email of {@code type} should reach {@code user}. */
    public boolean emailEnabled(User user, NotificationType type) {
        if (!user.isNotifyEmail()) {
            return false;
        }
        return preferenceRepository.findByUserIdAndEventType(user.getId(), type)
                .map(NotificationPreference::isEmail)
                .orElse(true);
    }

    @Transactional(readOnly = true)
    public List<NotificationPreferenceDto> list(AuthenticatedUser actor) {
        Map<NotificationType, NotificationPreference> byType = new EnumMap<>(NotificationType.class);
        for (NotificationPreference p : preferenceRepository.findAllByUserId(actor.id())) {
            byType.put(p.getEventType(), p);
        }
        return java.util.Arrays.stream(NotificationType.values())
                .map(type -> {
                    NotificationPreference p = byType.get(type);
                    return new NotificationPreferenceDto(
                            type,
                            p == null || p.isInApp(),
                            p == null || p.isEmail());
                })
                .toList();
    }

    @Transactional
    public NotificationPreferenceDto update(UpdateNotificationPreferenceRequest request, AuthenticatedUser actor) {
        User user = userRepository.findById(actor.id())
                .orElseThrow(() -> ResourceNotFoundException.of("User", actor.id()));
        NotificationPreference pref = preferenceRepository
                .findByUserIdAndEventType(actor.id(), request.eventType())
                .orElseGet(() -> NotificationPreference.builder()
                        .user(user)
                        .eventType(request.eventType())
                        .build());
        pref.setInApp(request.inApp());
        pref.setEmail(request.email());
        NotificationPreference saved = preferenceRepository.save(pref);
        return new NotificationPreferenceDto(saved.getEventType(), saved.isInApp(), saved.isEmail());
    }
}
