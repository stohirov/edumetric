package com.edumetric.backend.users;

import com.edumetric.backend.audit.AuditLogService;
import com.edumetric.backend.auth.dto.UserDto;
import com.edumetric.backend.common.exception.ConflictException;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.users.domain.Role;
import com.edumetric.backend.users.domain.User;
import com.edumetric.backend.users.dto.CreateUserRequest;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
