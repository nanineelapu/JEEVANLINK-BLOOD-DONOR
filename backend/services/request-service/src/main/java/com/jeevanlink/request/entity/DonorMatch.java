package com.jeevanlink.request.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "donor_matches")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DonorMatch {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private UUID requestId;

    @Column(nullable = false)
    private UUID donorId;

    private Double matchScore;

    @Column(columnDefinition = "TEXT")
    private String aiReasoning;

    private Double distanceKm;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MatchStatus status;

    @Column(nullable = false)
    private Instant matchedAt;

    @PrePersist
    void onCreate() { if (matchedAt == null) matchedAt = Instant.now(); }
}
