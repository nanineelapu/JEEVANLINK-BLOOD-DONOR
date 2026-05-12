package com.jeevanlink.donor.service;

import com.jeevanlink.donor.dto.DonorDto;
import com.jeevanlink.donor.entity.BloodGroup;
import com.jeevanlink.donor.entity.Donation;
import com.jeevanlink.donor.entity.Donor;
import com.jeevanlink.donor.exception.ApiException;
import com.jeevanlink.donor.repository.DonationRepository;
import com.jeevanlink.donor.repository.DonorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DonorService {

    private static final long ELIGIBILITY_DAYS = 90L;
    private static final int MIN_AGE = 18;
    private static final int MAX_AGE = 65;

    private final DonorRepository donorRepository;
    private final DonationRepository donationRepository;

    @Transactional
    public DonorDto.Response create(UUID userId, DonorDto.CreateRequest req) {
        if (donorRepository.existsById(userId)) {
            throw ApiException.conflict("Donor profile already exists");
        }
        Donor d = Donor.builder()
                .userId(userId)
                .bloodGroup(req.bloodGroup())
                .age(req.age())
                .latitude(req.latitude())
                .longitude(req.longitude())
                .city(req.city())
                .available(true)
                .totalDonations(0)
                .build();
        return toResponse(donorRepository.save(d));
    }

    public DonorDto.Response getById(UUID id) {
        return toResponse(donorRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Donor not found")));
    }

    @Transactional
    public DonorDto.Response update(UUID userId, DonorDto.UpdateRequest req) {
        Donor d = donorRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Donor not found"));
        if (req.bloodGroup() != null) d.setBloodGroup(req.bloodGroup());
        if (req.age() != null) d.setAge(req.age());
        if (req.latitude() != null) d.setLatitude(req.latitude());
        if (req.longitude() != null) d.setLongitude(req.longitude());
        if (req.city() != null) d.setCity(req.city());
        return toResponse(d);
    }

    @Transactional
    public DonorDto.Response setAvailability(UUID userId, boolean available) {
        Donor d = donorRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Donor not found"));
        d.setAvailable(available);
        return toResponse(d);
    }

    public List<DonorDto.Response> search(List<BloodGroup> bloodGroups, String city, Boolean available) {
        return donorRepository.search(
                bloodGroups == null || bloodGroups.isEmpty() ? null : bloodGroups,
                city, available
        ).stream().map(this::toResponse).toList();
    }

    public List<Donation> myDonations(UUID donorId) {
        return donationRepository.findByDonorIdOrderByDonatedAtDesc(donorId);
    }

    @Transactional
    public Donation logDonation(DonorDto.LogDonationRequest req) {
        Donor d = donorRepository.findById(req.donorId())
                .orElseThrow(() -> ApiException.notFound("Donor not found"));
        Donation donation = Donation.builder()
                .donorId(req.donorId())
                .hospitalId(req.hospitalId())
                .requestId(req.requestId())
                .bloodGroup(req.bloodGroup())
                .donatedAt(Instant.now())
                .build();
        donation = donationRepository.save(donation);
        d.setLastDonationDate(donation.getDonatedAt());
        d.setTotalDonations((d.getTotalDonations() == null ? 0 : d.getTotalDonations()) + 1);
        return donation;
    }

    private DonorDto.Response toResponse(Donor d) {
        boolean eligible = isEligible(d);
        Instant nextEligible = d.getLastDonationDate() == null
                ? null
                : d.getLastDonationDate().plus(ELIGIBILITY_DAYS, ChronoUnit.DAYS);
        return DonorDto.Response.from(d, eligible, nextEligible);
    }

    private boolean isEligible(Donor d) {
        if (!d.isAvailable()) return false;
        if (d.getAge() == null || d.getAge() < MIN_AGE || d.getAge() > MAX_AGE) return false;
        if (d.getLastDonationDate() == null) return true;
        return d.getLastDonationDate().isBefore(Instant.now().minus(ELIGIBILITY_DAYS, ChronoUnit.DAYS));
    }
}
