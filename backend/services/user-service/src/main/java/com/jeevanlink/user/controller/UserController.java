package com.jeevanlink.user.controller;

import com.jeevanlink.user.dto.UserResponse;
import com.jeevanlink.user.exception.ApiException;
import com.jeevanlink.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse me(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null) throw ApiException.unauthorized("Missing X-User-Id");
        return userService.getById(UUID.fromString(userId));
    }

    @GetMapping("/{id}")
    public UserResponse byId(@PathVariable UUID id) {
        return userService.getById(id);
    }
}
