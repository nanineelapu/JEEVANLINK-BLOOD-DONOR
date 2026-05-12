package com.jeevanlink.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class NotificationDto {

    public record SendRequest(
            @NotNull UUID userId,
            @NotBlank String type,
            @NotBlank String title,
            String message,
            UUID relatedRequestId
    ) {}
}
