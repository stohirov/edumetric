package com.edumetric.backend.users;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.auth.EmailVerificationService;
import com.edumetric.backend.auth.PasswordPolicy;
import com.edumetric.backend.auth.dto.UserDto;
import com.edumetric.backend.common.exception.BadRequestException;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.homework.FileStorageService;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import com.edumetric.backend.users.dto.CreateUserRequest;
import com.edumetric.backend.users.dto.UpdateProfileRequest;
import com.edumetric.backend.users.dto.UpdateUserRequest;
import java.io.InputStream;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    /** Avatars are capped well below the homework limit — they are small profile images. */
    private static final long MAX_AVATAR_BYTES = 5L * 1024 * 1024;

    /** Only raster image formats a browser can render inline are accepted as avatars. */
    private static final Set<String> ALLOWED_AVATAR_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final PasswordPolicy passwordPolicy;
    private final FileStorageService fileStorage;
    private final EmailVerificationService emailVerificationService;

    @Transactional(readOnly = true)
    public Page<UserDto> list(Role role, Pageable pageable) {
        Page<User> page = (role == null)
                ? userRepository.findAll(pageable)
                : userRepository.findAllByRole(role, pageable);
        return page.map(UserDto::from);
    }

    @Transactional(readOnly = true)
    public UserDto get(Long id) {
        return userRepository.findById(id).map(UserDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
    }

    @Transactional
    public UserDto create(CreateUserRequest request, AuthenticatedUser actor) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use: " + request.email());
        }
        passwordPolicy.validate(request.password());
        // Provisioned by an admin — the account holder must set their own password on first login.
        User user = userRepository.save(User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(request.role())
                .mustChangePassword(true)
                .build());
        auditLogService.log("User", user.getId(), "USER_CREATE",
                actor == null ? null : actor.id(),
                Map.of("email", user.getEmail(), "role", user.getRole().name()));
        // Issue a verification token (logged for dev delivery) so the owner can confirm their email.
        emailVerificationService.issueForNewUser(user);
        return UserDto.from(user);
    }

    @Transactional
    public UserDto update(Long id, UpdateUserRequest request, AuthenticatedUser actor) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        if (StringUtils.hasText(request.email()) && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new ConflictException("Email already in use: " + request.email());
            }
            user.setEmail(request.email());
        }
        if (StringUtils.hasText(request.password())) {
            passwordPolicy.validate(request.password());
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            // An admin-set password is provisional — force the owner to change it.
            user.setMustChangePassword(true);
        }
        if (StringUtils.hasText(request.fullName())) {
            user.setFullName(request.fullName());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.emergencyContact() != null) {
            String contact = request.emergencyContact().trim();
            user.setEmergencyContact(contact.isEmpty() ? null : contact);
        }
        if (request.departmentId() != null) {
            // A sentinel of 0 clears the department assignment.
            user.setDepartmentId(request.departmentId() == 0 ? null : request.departmentId());
        }
        auditLogService.log("User", user.getId(), "USER_UPDATE",
                actor == null ? null : actor.id(),
                Map.of("email", user.getEmail(), "role", user.getRole().name()));
        return UserDto.from(user);
    }

    @Transactional
    public UserDto updateOwnProfile(Long id, UpdateProfileRequest request, AuthenticatedUser actor) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        if (StringUtils.hasText(request.email()) && !request.email().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new ConflictException("Email already in use: " + request.email());
            }
            user.setEmail(request.email());
        }
        boolean passwordChanged = StringUtils.hasText(request.password());
        if (passwordChanged) {
            passwordPolicy.validate(request.password());
            user.setPasswordHash(passwordEncoder.encode(request.password()));
            // The owner picked this password themselves — clear any forced-change flag.
            user.setMustChangePassword(false);
        }
        if (StringUtils.hasText(request.fullName())) {
            user.setFullName(request.fullName());
        }
        if (StringUtils.hasText(request.language())) {
            user.setLanguage(request.language());
        }
        if (request.notifyEmail() != null) {
            user.setNotifyEmail(request.notifyEmail());
        }
        if (request.notifyInApp() != null) {
            user.setNotifyInApp(request.notifyInApp());
        }
        // Contact fields are optional and clearable: a present-but-blank value resets them to null.
        if (request.phone() != null) {
            String phone = request.phone().trim();
            user.setPhone(phone.isEmpty() ? null : phone);
        }
        if (request.address() != null) {
            String address = request.address().trim();
            user.setAddress(address.isEmpty() ? null : address);
        }
        auditLogService.log("User", user.getId(), "PROFILE_UPDATE",
                actor == null ? null : actor.id(),
                Map.of("email", user.getEmail()));
        if (passwordChanged) {
            auditLogService.log("User", user.getId(), "PASSWORD_CHANGE",
                    actor == null ? null : actor.id(),
                    Map.of("email", user.getEmail()));
        }
        return UserDto.from(user);
    }

    /** Stores (or replaces) the avatar image for the user's own account. */
    @Transactional
    public UserDto updateAvatar(Long id, MultipartFile file, AuthenticatedUser actor) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        validateAvatar(file);
        // A stable, per-user key means a re-upload overwrites the previous image (no orphans).
        String objectKey = "avatars/%d".formatted(id);
        fileStorage.upload(objectKey, file);
        user.setAvatarKey(objectKey);
        user.setAvatarContentType(file.getContentType());
        auditLogService.log("User", user.getId(), "AVATAR_UPDATE",
                actor == null ? null : actor.id(),
                Map.of("email", user.getEmail()));
        return UserDto.from(user);
    }

    /** Clears the avatar reference so the account falls back to its initials. */
    @Transactional
    public UserDto removeAvatar(Long id, AuthenticatedUser actor) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        user.setAvatarKey(null);
        user.setAvatarContentType(null);
        auditLogService.log("User", user.getId(), "AVATAR_REMOVE",
                actor == null ? null : actor.id(),
                Map.of("email", user.getEmail()));
        return UserDto.from(user);
    }

    /** Opens a stream to the user's avatar image; caller must close the stream. */
    @Transactional(readOnly = true)
    public ProfileAvatar getAvatar(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        if (user.getAvatarKey() == null) {
            throw ResourceNotFoundException.of("Avatar", id);
        }
        String contentType = user.getAvatarContentType() != null
                ? user.getAvatarContentType()
                : "application/octet-stream";
        return new ProfileAvatar(fileStorage.download(user.getAvatarKey()), contentType);
    }

    private static void validateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Avatar file is required");
        }
        if (file.getSize() > MAX_AVATAR_BYTES) {
            throw new BadRequestException("Avatar exceeds the 5 MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_AVATAR_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Avatar must be a JPEG, PNG, WebP, or GIF image");
        }
    }

    /**
     * Suspends or reactivates an account. Unlike deletion this is fully reversible and
     * retains all data — a SUSPENDED user simply cannot authenticate.
     */
    @Transactional
    public UserDto setSuspended(Long id, boolean suspended, AuthenticatedUser actor) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        user.setStatus(suspended
                ? com.edumetric.backend.users.domain.AccountStatus.SUSPENDED
                : com.edumetric.backend.users.domain.AccountStatus.ACTIVE);
        auditLogService.log("User", user.getId(), suspended ? "USER_SUSPEND" : "USER_REACTIVATE",
                actor == null ? null : actor.id(),
                Map.of("email", user.getEmail()));
        return UserDto.from(user);
    }

    @Transactional
    public void delete(Long id, AuthenticatedUser actor) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("User", id));
        userRepository.delete(user);
        auditLogService.log("User", id, "USER_DELETE",
                actor == null ? null : actor.id(),
                Map.of("email", user.getEmail(), "role", user.getRole().name()));
    }

    /** An avatar image stream ready to be streamed back to the client. */
    public record ProfileAvatar(InputStream stream, String contentType) {
    }
}
