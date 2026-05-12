package com.jeevanlink.notification.controller;

import com.jeevanlink.notification.dto.NotificationDto;
import com.jeevanlink.notification.entity.Notification;
import com.jeevanlink.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    @PostMapping("/send")
    public Notification send(@Valid @RequestBody NotificationDto.SendRequest req) {
        return service.send(req);
    }

    @GetMapping
    public List<Notification> list(@RequestHeader("X-User-Id") String userId) {
        return service.listFor(UUID.fromString(userId));
    }

    @PatchMapping("/{id}/read")
    public Notification markRead(@PathVariable UUID id) {
        return service.markRead(id);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(@RequestHeader("X-User-Id") String userId) {
        return Map.of("unread", service.unreadCount(UUID.fromString(userId)));
    }
}
