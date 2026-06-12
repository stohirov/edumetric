package com.edumetric.backend.notifications.domain;

/** Audience of an {@link Announcement}. */
public enum AnnouncementScope {
    /** Everyone in the institution (admin only). */
    ALL,
    /** A single group (teacher of that group, or admin). */
    GROUP
}
