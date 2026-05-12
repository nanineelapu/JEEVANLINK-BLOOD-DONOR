package com.jeevanlink.user.controller;

import com.jeevanlink.user.dto.AuthResponse;
import com.jeevanlink.user.dto.LoginRequest;
import com.jeevanlink.user.dto.RegisterRequest;
import com.jeevanlink.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return userService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return userService.login(req);
    }
}
