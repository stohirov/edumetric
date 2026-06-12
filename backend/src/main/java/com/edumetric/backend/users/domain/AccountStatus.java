package com.edumetric.backend.users.domain;

/**
 * Lifecycle state of a user account, distinct from soft-deletion.
 * SUSPENDED accounts retain all data but are blocked from authenticating.
 */
public enum AccountStatus {
    ACTIVE,
    SUSPENDED
}
