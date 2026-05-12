package com.jeevanlink.donor.dto;

import com.jeevanlink.donor.entity.BloodGroup;
import com.jeevanlink.donor.entity.Donor;
import jakarta.validation.constraints.*;

import java.time.Instant;
import java.util.UUID;

public class DonorDto {

    public record CreateRequest(
            @NotNull BloodGroup bloodGroup,
            @Min(16) @Max(100) Integer age,
            Double latitude,
            Double longitude,
            String city
    ) {}

    public record UpdateRequest(
            BloodGroup bloodGroup,
            @Min(16) @Max(100) Integer age,
            Double latitude,
            Double longitude,
            String city
    ) {}

    public record AvailabilityRequest(@NotNull Boolean available) {}

    public record LogDonationRequest(
            @NotNull UUID donorId,
            @NotNull UUID hospitalId,
            UUID requestId,
            @NotNull BloodGroup bloodGroup
    ) {}

    public record Response(
            UUID userId,
            BloodGroup bloodGroup,
            Integer age,
            Double latitude,
            Double longitude,
            String city,
            Instant lastDonationDate,
            boolean available,
            Integer totalDonations,
            boolean eligible,
            Instant nextEligibleDate
    ) {
        public static Response from(Donor d, boolean eligible, Instant nextEligibleDate) {
            return new Response(
                    d.getUserId(), d.getBloodGroup(), d.getAge(),
                    d.getLatitude(), d.getLongitude(), d.getCity(),
                    d.getLastDonationDate(), d.isAvailable(),
                    d.getTotalDonations() == null ? 0 : d.getTotalDonations(),
                    eligible, nextEligibleDate
            );
        }
    }
}
