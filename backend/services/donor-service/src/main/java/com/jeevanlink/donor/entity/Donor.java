package com.jeevanlink.donor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "donors")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Donor {

    @Id
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodGroup bloodGroup;

    private Integer age;

    private Double latitude;

    private Double longitude;

    private String city;

    private Instant lastDonationDate;

    @Builder.Default
    private boolean available = true;

    @Builder.Default
    private Integer totalDonations = 0;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
