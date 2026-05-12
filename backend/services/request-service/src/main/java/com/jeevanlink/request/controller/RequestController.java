package com.jeevanlink.request.controller;

import com.jeevanlink.request.dto.RequestDto;
import com.jeevanlink.request.entity.BloodGroup;
import com.jeevanlink.request.entity.RequestStatus;
import com.jeevanlink.request.exception.ApiException;
import com.jeevanlink.request.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService service;

    @PostMapping
    public RequestDto.Response create(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @Valid @RequestBody RequestDto.CreateRequest req
    ) {
        if (role != null && !"HOSPITAL_ADMIN".equals(role)) {
            throw ApiException.forbidden("Only hospitals can create requests");
        }
        return service.create(UUID.fromString(userId), req);
    }

    @GetMapping
    public List<RequestDto.Response> list(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestParam(required = false) RequestStatus status,
            @RequestParam(required = false) BloodGroup bloodGroup
    ) {
        if ("HOSPITAL_ADMIN".equals(role) && userId != null && status == null && bloodGroup == null) {
            return service.hospitalRequests(UUID.fromString(userId));
        }
        return service.filter(status, bloodGroup);
    }

    @GetMapping("/{id}")
    public RequestDto.Response getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PatchMapping("/{id}/cancel")
    public RequestDto.Response cancel(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID id
    ) {
        return service.cancel(id, UUID.fromString(userId));
    }

    @PatchMapping("/{id}/fulfill")
    public RequestDto.Response fulfill(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID id
    ) {
        return service.fulfill(id, UUID.fromString(userId));
    }

    @GetMapping("/donor/me")
    public List<RequestDto.MatchResponse> donorMatches(@RequestHeader("X-User-Id") String userId) {
        return service.donorMatches(UUID.fromString(userId));
    }

    @PatchMapping("/match/{matchId}/accept")
    public RequestDto.MatchResponse accept(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID matchId
    ) {
        return service.accept(matchId, UUID.fromString(userId));
    }

    @PatchMapping("/match/{matchId}/decline")
    public RequestDto.MatchResponse decline(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable UUID matchId
    ) {
        return service.decline(matchId, UUID.fromString(userId));
    }
}
