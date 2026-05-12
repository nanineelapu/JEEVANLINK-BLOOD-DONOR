package com.jeevanlink.user.dto;

import com.jeevanlink.user.entity.Role;

import java.util.UUID;

public record AuthResponse(
        String token,
        UUID userId,
        String email,
        Role role,
        String fullName
) {}
