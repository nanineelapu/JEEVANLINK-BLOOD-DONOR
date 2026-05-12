package com.jeevanlink.request.repository;

import com.jeevanlink.request.entity.BloodGroup;
import com.jeevanlink.request.entity.BloodRequest;
import com.jeevanlink.request.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, UUID> {

    List<BloodRequest> findByHospitalIdOrderByCreatedAtDesc(UUID hospitalId);

    @Query("""
        SELECT r FROM BloodRequest r
        WHERE (:status IS NULL OR r.status = :status)
          AND (:bloodGroup IS NULL OR r.bloodGroup = :bloodGroup)
        ORDER BY r.createdAt DESC
        """)
    List<BloodRequest> filter(RequestStatus status, BloodGroup bloodGroup);
}
