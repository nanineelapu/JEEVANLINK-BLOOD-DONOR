package com.jeevanlink.donor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "donations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Donation {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID donorId;

    @Column(nullable = false)
    private UUID hospitalId;

    private UUID requestId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodGroup bloodGroup;

    @Column(nullable = false)
    private Instant donatedAt;

    @PrePersist
    void onCreate() {
        if (donatedAt == null) donatedAt = Instant.now();
    }
}
