package com.jeevanlink.hospital.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "hospitals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Hospital {
    @Id
    private UUID userId;

    @Column(nullable = false)
    private String name;

    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private String contactPhone;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() { if (createdAt == null) createdAt = Instant.now(); }
}
