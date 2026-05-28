package com.edumetric.backend.users;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.auth.dto.UserDto;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import com.edumetric.backend.users.dto.CreateUserRequest;
import com.edumetric.backend.users.dto.UpdateUserRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

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
        User user = userRepository.save(User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .fullName(request.fullName())
                .role(request.role())
                .build());
        auditLogService.log("User", user.getId(), "USER_CREATE",
                actor == null ? null : actor.id(),
                Map.of("email", user.getEmail(), "role", user.getRole().name()));
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
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        if (StringUtils.hasText(request.fullName())) {
            user.setFullName(request.fullName());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        auditLogService.log("User", user.getId(), "USER_UPDATE",
                actor == null ? null : actor.id(),
                Map.of("email", user.getEmail(), "role", user.getRole().name()));
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
}
