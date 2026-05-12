package com.jeevanlink.hospital.controller;

import com.jeevanlink.hospital.dto.HospitalDto;
import com.jeevanlink.hospital.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final HospitalService service;

    @GetMapping("/me")
    public List<HospitalDto.InventoryResponse> myInventory(@RequestHeader("X-User-Id") String userId) {
        return service.getInventory(UUID.fromString(userId));
    }

    @PostMapping
    public HospitalDto.InventoryResponse upsert(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody HospitalDto.InventoryUpsert req
    ) {
        return service.upsertInventory(UUID.fromString(userId), req);
    }

    @PatchMapping("/{id}/add")
    public HospitalDto.InventoryResponse add(@PathVariable UUID id, @Valid @RequestBody HospitalDto.UnitsRequest req) {
        return service.addUnits(id, req.units());
    }

    @PatchMapping("/{id}/use")
    public HospitalDto.InventoryResponse use(@PathVariable UUID id, @Valid @RequestBody HospitalDto.UnitsRequest req) {
        return service.useUnits(id, req.units());
    }
}
