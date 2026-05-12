package com.jeevanlink.notification.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "user-service")
public interface UserClient {

    record UserResponse(UUID id, String email, String fullName, String phone) {}

    @GetMapping("/api/users/{id}")
    UserResponse getById(@PathVariable("id") UUID id);
}
