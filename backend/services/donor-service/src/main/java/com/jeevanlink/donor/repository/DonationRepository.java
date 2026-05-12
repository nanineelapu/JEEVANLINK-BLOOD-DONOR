package com.jeevanlink.donor.repository;

import com.jeevanlink.donor.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DonationRepository extends JpaRepository<Donation, UUID> {
    List<Donation> findByDonorIdOrderByDonatedAtDesc(UUID donorId);
}
