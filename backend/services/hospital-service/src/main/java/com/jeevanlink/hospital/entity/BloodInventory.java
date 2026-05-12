package com.jeevanlink.hospital.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "blood_inventory", uniqueConstraints =
        @UniqueConstraint(columnNames = {"hospital_id", "blood_group"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BloodInventory {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID hospitalId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodGroup bloodGroup;

    @Column(nullable = false)
    @Builder.Default
    private Integer unitsAvailable = 0;

    @Column(nullable = false)
    private Instant lastUpdated;

    @PrePersist @PreUpdate
    void touch() { lastUpdated = Instant.now(); }
}
