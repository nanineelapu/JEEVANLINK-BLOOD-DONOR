package com.jeevanlink.request.client;

import com.jeevanlink.request.entity.BloodGroup;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@FeignClient(name = "donor-service")
public interface DonorClient {

    record DonorResponse(UUID userId, BloodGroup bloodGroup, String city,
                         Double latitude, Double longitude, Integer totalDonations, boolean available) {}

    record LogDonationRequest(UUID donorId, UUID hospitalId, UUID requestId, BloodGroup bloodGroup) {}

    @GetMapping("/api/donors/{id}")
    DonorResponse getById(@PathVariable("id") UUID id);

    @PostMapping("/api/donors/donations")
    Object logDonation(@RequestBody LogDonationRequest req);
}
