package com.jeevanlink.donor.repository;

import com.jeevanlink.donor.entity.BloodGroup;
import com.jeevanlink.donor.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface DonorRepository extends JpaRepository<Donor, UUID> {

    @Query("""
       SELECT d FROM Donor d
       WHERE (:bloodGroups IS NULL OR d.bloodGroup IN :bloodGroups)
         AND (:city IS NULL OR LOWER(d.city) = LOWER(:city))
         AND (:available IS NULL OR d.available = :available)
       """)
    List<Donor> search(List<BloodGroup> bloodGroups, String city, Boolean available);
}
