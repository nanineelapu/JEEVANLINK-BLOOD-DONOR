package com.jeevanlink.request.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "hospital-service")
public interface HospitalClient {

    record HospitalResponse(UUID userId, String name, String address, String city,
                            Double latitude, Double longitude, String contactPhone) {}

    @GetMapping("/api/hospitals/{id}")
    HospitalResponse getById(@PathVariable("id") UUID id);
}
