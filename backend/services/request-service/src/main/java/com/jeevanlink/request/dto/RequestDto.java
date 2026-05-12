package com.jeevanlink.request.dto;

import com.jeevanlink.request.entity.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class RequestDto {

    public record CreateRequest(
            @NotNull BloodGroup bloodGroup,
            @NotNull @Min(1) Integer unitsRequired,
            @NotNull Priority priority,
            @NotBlank String patientName,
            String reason
    ) {}

    public record Response(
            UUID id, UUID hospitalId, BloodGroup bloodGroup, Integer unitsRequired,
            Priority priority, String patientName, String reason,
            RequestStatus status, Instant createdAt, Instant fulfilledAt,
            List<MatchResponse> matches
    ) {
        public static Response from(BloodRequest r, List<MatchResponse> matches) {
            return new Response(r.getId(), r.getHospitalId(), r.getBloodGroup(),
                    r.getUnitsRequired(), r.getPriority(), r.getPatientName(),
                    r.getReason(), r.getStatus(), r.getCreatedAt(), r.getFulfilledAt(), matches);
        }
    }

    public record MatchResponse(
            UUID id, UUID requestId, UUID donorId,
            Double matchScore, Double distanceKm, String aiReasoning,
            MatchStatus status, Instant matchedAt
    ) {
        public static MatchResponse from(DonorMatch m) {
            return new MatchResponse(m.getId(), m.getRequestId(), m.getDonorId(),
                    m.getMatchScore(), m.getDistanceKm(), m.getAiReasoning(),
                    m.getStatus(), m.getMatchedAt());
        }
    }
}
