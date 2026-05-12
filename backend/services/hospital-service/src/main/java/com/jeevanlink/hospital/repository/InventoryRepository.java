package com.jeevanlink.hospital.repository;

import com.jeevanlink.hospital.entity.BloodGroup;
import com.jeevanlink.hospital.entity.BloodInventory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<BloodInventory, UUID> {
    List<BloodInventory> findByHospitalIdOrderByBloodGroup(UUID hospitalId);
    Optional<BloodInventory> findByHospitalIdAndBloodGroup(UUID hospitalId, BloodGroup bloodGroup);
}
