package com.edumetric.backend.users.domain;

import com.edumetric.backend.common.audit.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@SQLDelete(sql = "UPDATE users SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class User extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private Role role;

    @Column(nullable = false, length = 8)
    @Builder.Default
    private String language = "en";

    @Column(name = "notify_email", nullable = false)
    @Builder.Default
    private boolean notifyEmail = true;

    @Column(name = "notify_in_app", nullable = false)
    @Builder.Default
    private boolean notifyInApp = true;

    /** Consecutive failed login attempts since the last successful login. */
    @Column(name = "failed_login_attempts", nullable = false)
    @Builder.Default
    private int failedLoginAttempts = 0;

    /** When set and in the future, the account is locked out of login until this instant. */
    @Column(name = "locked_until")
    private java.time.Instant lockedUntil;

    /** True for provisioned accounts that must set a new password before using the app. */
    @Column(name = "must_change_password", nullable = false)
    @Builder.Default
    private boolean mustChangePassword = false;

    /** True once the owner has confirmed ownership of their email via a verification token. */
    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    /** Base32-encoded TOTP shared secret. Set during 2FA setup; may be pending until enabled. */
    @Column(name = "totp_secret", length = 64)
    private String totpSecret;

    /** True once the owner has verified a TOTP code and activated two-factor auth. */
    @Column(name = "totp_enabled", nullable = false)
    @Builder.Default
    private boolean totpEnabled = false;

    /** Optional contact phone number, owner-editable via self-service profile. */
    @Column(length = 32)
    private String phone;

    /** Optional postal/contact address, owner-editable via self-service profile. */
    @Column(length = 500)
    private String address;

    /** MinIO object key for the profile avatar image; null when no avatar is set. */
    @Column(name = "avatar_key", length = 512)
    private String avatarKey;

    /** Stored content type of the avatar image, used when streaming it back. */
    @Column(name = "avatar_content_type", length = 100)
    private String avatarContentType;

    /** Account lifecycle state. SUSPENDED accounts are retained but cannot authenticate. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;

    /** Optional emergency contact (name + phone), owner- or admin-editable. */
    @Column(name = "emergency_contact", length = 500)
    private String emergencyContact;

    /** Optional department/faculty this user belongs to (mainly teachers/admins). */
    @Column(name = "department_id")
    private Long departmentId;
}
