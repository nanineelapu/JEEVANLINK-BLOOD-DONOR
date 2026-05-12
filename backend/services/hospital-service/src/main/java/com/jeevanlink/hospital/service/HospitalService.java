package com.jeevanlink.hospital.service;

import com.jeevanlink.hospital.dto.HospitalDto;
import com.jeevanlink.hospital.entity.BloodGroup;
import com.jeevanlink.hospital.entity.BloodInventory;
import com.jeevanlink.hospital.entity.Hospital;
import com.jeevanlink.hospital.exception.ApiException;
import com.jeevanlink.hospital.repository.HospitalRepository;
import com.jeevanlink.hospital.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional
    public HospitalDto.Response create(UUID userId, HospitalDto.CreateRequest req) {
        if (hospitalRepository.existsById(userId)) {
            throw ApiException.conflict("Hospital profile already exists");
        }
        Hospital h = Hospital.builder()
                .userId(userId)
                .name(req.name())
                .address(req.address())
                .city(req.city())
                .latitude(req.latitude())
                .longitude(req.longitude())
                .contactPhone(req.contactPhone())
                .build();
        h = hospitalRepository.save(h);
        // Seed all 8 blood group inventory entries with 0 units
        for (BloodGroup bg : BloodGroup.values()) {
            inventoryRepository.save(BloodInventory.builder()
                    .hospitalId(h.getUserId())
                    .bloodGroup(bg)
                    .unitsAvailable(0)
                    .build());
        }
        return HospitalDto.Response.from(h);
    }

    public HospitalDto.Response getById(UUID id) {
        return HospitalDto.Response.from(hospitalRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Hospital not found")));
    }

    @Transactional
    public HospitalDto.Response update(UUID userId, HospitalDto.UpdateRequest req) {
        Hospital h = hospitalRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Hospital not found"));
        if (req.name() != null) h.setName(req.name());
        if (req.address() != null) h.setAddress(req.address());
        if (req.city() != null) h.setCity(req.city());
        if (req.latitude() != null) h.setLatitude(req.latitude());
        if (req.longitude() != null) h.setLongitude(req.longitude());
        if (req.contactPhone() != null) h.setContactPhone(req.contactPhone());
        return HospitalDto.Response.from(h);
    }

    public List<HospitalDto.InventoryResponse> getInventory(UUID hospitalId) {
        return inventoryRepository.findByHospitalIdOrderByBloodGroup(hospitalId)
                .stream().map(HospitalDto.InventoryResponse::from).toList();
    }

    @Transactional
    public HospitalDto.InventoryResponse upsertInventory(UUID hospitalId, HospitalDto.InventoryUpsert req) {
        BloodInventory inv = inventoryRepository
                .findByHospitalIdAndBloodGroup(hospitalId, req.bloodGroup())
                .orElseGet(() -> BloodInventory.builder()
                        .hospitalId(hospitalId)
                        .bloodGroup(req.bloodGroup())
                        .unitsAvailable(0)
                        .build());
        inv.setUnitsAvailable(req.unitsAvailable());
        return HospitalDto.InventoryResponse.from(inventoryRepository.save(inv));
    }

    @Transactional
    public HospitalDto.InventoryResponse addUnits(UUID id, int units) {
        BloodInventory inv = inventoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Inventory item not found"));
        inv.setUnitsAvailable(inv.getUnitsAvailable() + units);
        return HospitalDto.InventoryResponse.from(inv);
    }

    @Transactional
    public HospitalDto.InventoryResponse useUnits(UUID id, int units) {
        BloodInventory inv = inventoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Inventory item not found"));
        int next = inv.getUnitsAvailable() - units;
        if (next < 0) throw ApiException.badRequest("Insufficient units");
        inv.setUnitsAvailable(next);
        return HospitalDto.InventoryResponse.from(inv);
    }
}
