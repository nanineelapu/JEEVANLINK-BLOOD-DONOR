package com.jeevanlink.hospital.dto;

import com.jeevanlink.hospital.entity.BloodGroup;
import com.jeevanlink.hospital.entity.BloodInventory;
import com.jeevanlink.hospital.entity.Hospital;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class HospitalDto {

    public record CreateRequest(
            @NotBlank String name,
            String address,
            String city,
            Double latitude,
            Double longitude,
            String contactPhone
    ) {}

    public record UpdateRequest(
            String name, String address, String city,
            Double latitude, Double longitude, String contactPhone
    ) {}

    public record Response(
            UUID userId, String name, String address, String city,
            Double latitude, Double longitude, String contactPhone, Instant createdAt
    ) {
        public static Response from(Hospital h) {
            return new Response(h.getUserId(), h.getName(), h.getAddress(), h.getCity(),
                    h.getLatitude(), h.getLongitude(), h.getContactPhone(), h.getCreatedAt());
        }
    }

    public record InventoryUpsert(
            @NotNull BloodGroup bloodGroup,
            @NotNull @Min(0) Integer unitsAvailable
    ) {}

    public record UnitsRequest(@NotNull @Min(1) Integer units) {}

    public record InventoryResponse(
            UUID id, UUID hospitalId, BloodGroup bloodGroup,
            Integer unitsAvailable, Instant lastUpdated
    ) {
        public static InventoryResponse from(BloodInventory inv) {
            return new InventoryResponse(inv.getId(), inv.getHospitalId(), inv.getBloodGroup(),
                    inv.getUnitsAvailable(), inv.getLastUpdated());
        }
    }
}
