package com.jeevanlink.notification.service;

import com.jeevanlink.notification.client.UserClient;
import com.jeevanlink.notification.dto.NotificationDto;
import com.jeevanlink.notification.entity.Notification;
import com.jeevanlink.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository repo;
    private final UserClient userClient;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Transactional
    public Notification send(NotificationDto.SendRequest req) {
        Notification n = repo.save(Notification.builder()
                .userId(req.userId())
                .type(req.type())
                .title(req.title())
                .message(req.message())
                .relatedRequestId(req.relatedRequestId())
                .read(false)
                .build());

        // Try email; silently fall back to console log if SMTP not configured.
        if (mailFrom != null && !mailFrom.isBlank()) {
            try {
                UserClient.UserResponse u = userClient.getById(req.userId());
                if (u != null && u.email() != null && !u.email().isBlank()) {
                    SimpleMailMessage msg = new SimpleMailMessage();
                    msg.setFrom(mailFrom);
                    msg.setTo(u.email());
                    msg.setSubject("[JEEVANLINK] " + req.title());
                    msg.setText(req.message() == null ? req.title() : req.message());
                    mailSender.send(msg);
                    log.info("Sent email to {} for type {}", u.email(), req.type());
                }
            } catch (Exception ex) {
                log.warn("Email send failed (in-app saved): {}", ex.getMessage());
            }
        } else {
            log.info("[NOTIFICATION] user={}, type={}, title={}", req.userId(), req.type(), req.title());
        }
        return n;
    }

    public List<Notification> listFor(UUID userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Notification markRead(UUID id) {
        Notification n = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        return n;
    }

    public long unreadCount(UUID userId) {
        return repo.countByUserIdAndReadFalse(userId);
    }
}
