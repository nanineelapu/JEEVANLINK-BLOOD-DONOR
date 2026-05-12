package com.jeevanlink.matcher.dto;

import com.jeevanlink.matcher.entity.BloodGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class MatcherDto {

    public record MatchRequest(
            UUID requestId,
            @NotNull BloodGroup bloodGroup,
            Double hospitalLat,
            Double hospitalLng,
            String city
    ) {}

    public record MatchedDonor(
            UUID donorId,
            Double matchScore,
            Double distanceKm,
            String reasoning
    ) {}

    public record EligibilityRequest(@NotNull UUID donorId) {}

    public record EligibilityResponse(
            boolean eligible,
            String reason,
            Instant nextEligibleDate
    ) {}

    public record ChatRequest(@NotBlank String message) {}

    public record ChatResponse(String response) {}
}
