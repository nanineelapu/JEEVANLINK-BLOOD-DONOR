package com.jeevanlink.matcher.client;

import com.jeevanlink.matcher.entity.BloodGroup;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@FeignClient(name = "donor-service")
public interface DonorClient {

    record DonorResponse(
            UUID userId, BloodGroup bloodGroup, Integer age,
            Double latitude, Double longitude, String city,
            Instant lastDonationDate, boolean available,
            Integer totalDonations, boolean eligible, Instant nextEligibleDate
    ) {}

    @GetMapping("/api/donors/{id}")
    DonorResponse getById(@PathVariable("id") UUID id);

    @GetMapping("/api/donors/search")
    List<DonorResponse> search(
            @RequestParam(value = "bloodGroup", required = false) List<BloodGroup> bloodGroup,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "available", required = false) Boolean available
    );
}
