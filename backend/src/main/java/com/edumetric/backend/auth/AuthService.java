package com.edumetric.backend.auth;

import com.edumetric.backend.auth.dto.LoginRequest;
import com.edumetric.backend.auth.dto.LoginResponse;
import com.edumetric.backend.auth.dto.UserDto;
import com.edumetric.backend.common.exception.ResourceNotFoundException;
import com.edumetric.backend.security.AuthenticatedUser;
import com.edumetric.backend.security.JwtTokenProvider;
import com.edumetric.backend.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        AuthenticatedUser principal = (AuthenticatedUser) auth.getPrincipal();
        String token = tokenProvider.generateToken(principal);
        long expiresInSeconds = tokenProvider.getExpiration().toSeconds();

        UserDto userDto = new UserDto(principal.id(), principal.email(), principal.fullName(), principal.role());
        return new LoginResponse(token, expiresInSeconds, userDto);
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .map(UserDto::from)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
    }
}
