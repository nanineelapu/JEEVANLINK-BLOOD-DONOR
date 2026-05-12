package com.jeevanlink.hospital.controller;

import com.jeevanlink.hospital.dto.HospitalDto;
import com.jeevanlink.hospital.exception.ApiException;
import com.jeevanlink.hospital.service.HospitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService service;

    @PostMapping
    public HospitalDto.Response create(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody HospitalDto.CreateRequest req
    ) {
        if (userId == null) throw ApiException.unauthorized("Missing X-User-Id");
        return service.create(UUID.fromString(userId), req);
    }

    @GetMapping("/me")
    public HospitalDto.Response me(@RequestHeader("X-User-Id") String userId) {
        return service.getById(UUID.fromString(userId));
    }

    @PutMapping("/me")
    public HospitalDto.Response updateMe(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody HospitalDto.UpdateRequest req
    ) {
        return service.update(UUID.fromString(userId), req);
    }

    @GetMapping("/{id}")
    public HospitalDto.Response byId(@PathVariable UUID id) {
        return service.getById(id);
    }
}
