package com.jeevanlink.user.service;

import com.jeevanlink.user.dto.AuthResponse;
import com.jeevanlink.user.dto.LoginRequest;
import com.jeevanlink.user.dto.RegisterRequest;
import com.jeevanlink.user.dto.UserResponse;
import com.jeevanlink.user.entity.User;
import com.jeevanlink.user.exception.ApiException;
import com.jeevanlink.user.repository.UserRepository;
import com.jeevanlink.user.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw ApiException.conflict("Email already registered");
        }
        User user = User.builder()
                .email(req.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .phone(req.phone())
                .role(req.role())
                .build();
        user = userRepository.save(user);
        String token = jwtService.generate(user);
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole(), user.getFullName());
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw ApiException.unauthorized("Invalid email or password");
        }
        String token = jwtService.generate(user);
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getRole(), user.getFullName());
    }

    public UserResponse getById(UUID id) {
        return UserResponse.from(userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found")));
    }
}
