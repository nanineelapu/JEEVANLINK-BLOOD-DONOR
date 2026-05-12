package com.jeevanlink.request.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "blood_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BloodRequest {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID hospitalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodGroup bloodGroup;

    @Column(nullable = false)
    private Integer unitsRequired;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    private String patientName;
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant fulfilledAt;

    @PrePersist
    void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
}
