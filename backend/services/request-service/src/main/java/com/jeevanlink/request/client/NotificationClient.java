package com.jeevanlink.request.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@FeignClient(name = "notification-service")
public interface NotificationClient {

    record NotificationRequest(UUID userId, String type, String title, String message, UUID relatedRequestId) {}

    @PostMapping("/api/notifications/send")
    Object send(@RequestBody NotificationRequest req);
}
