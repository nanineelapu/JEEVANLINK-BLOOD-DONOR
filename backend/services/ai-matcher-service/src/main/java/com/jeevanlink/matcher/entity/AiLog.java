package com.jeevanlink.matcher.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String operation;

    @Column(columnDefinition = "TEXT")
    private String prompt;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
}
