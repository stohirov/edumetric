package com.edumetric.backend.notifications.domain;

/** The kind of event a {@link Notification} was raised for. */
public enum NotificationType {
    GRADE_POSTED,
    ANNOUNCEMENT,
    ABSENCE_MARKED,
    MESSAGE_RECEIVED,
    REMINDER
}
