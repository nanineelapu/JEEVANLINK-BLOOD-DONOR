package com.jeevanlink.user.dto;

import com.jeevanlink.user.entity.Role;
import com.jeevanlink.user.entity.User;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        String phone,
        Role role,
        Instant createdAt
) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getEmail(), u.getFullName(), u.getPhone(), u.getRole(), u.getCreatedAt());
    }
}
