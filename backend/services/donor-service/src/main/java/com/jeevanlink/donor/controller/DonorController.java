package com.jeevanlink.donor.controller;

import com.jeevanlink.donor.dto.DonorDto;
import com.jeevanlink.donor.entity.BloodGroup;
import com.jeevanlink.donor.entity.Donation;
import com.jeevanlink.donor.exception.ApiException;
import com.jeevanlink.donor.service.DonorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;

    @PostMapping
    public DonorDto.Response create(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody DonorDto.CreateRequest req
    ) {
        if (userId == null) throw ApiException.unauthorized("Missing X-User-Id");
        return donorService.create(UUID.fromString(userId), req);
    }

    @GetMapping("/me")
    public DonorDto.Response me(@RequestHeader("X-User-Id") String userId) {
        return donorService.getById(UUID.fromString(userId));
    }

    @PutMapping("/me")
    public DonorDto.Response updateMe(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody DonorDto.UpdateRequest req
    ) {
        return donorService.update(UUID.fromString(userId), req);
    }

    @PatchMapping("/me/availability")
    public DonorDto.Response toggleAvailability(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody DonorDto.AvailabilityRequest req
    ) {
        return donorService.setAvailability(UUID.fromString(userId), req.available());
    }

    @GetMapping("/{id}")
    public DonorDto.Response byId(@PathVariable UUID id) {
        return donorService.getById(id);
    }

    @GetMapping("/search")
    public List<DonorDto.Response> search(
            @RequestParam(required = false) List<BloodGroup> bloodGroup,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean available
    ) {
        return donorService.search(bloodGroup, city, available);
    }

    @GetMapping("/me/donations")
    public List<Donation> myDonations(@RequestHeader("X-User-Id") String userId) {
        return donorService.myDonations(UUID.fromString(userId));
    }

    @PostMapping("/donations")
    public Donation logDonation(@Valid @RequestBody DonorDto.LogDonationRequest req) {
        return donorService.logDonation(req);
    }
}
