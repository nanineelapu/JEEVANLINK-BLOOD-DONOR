package com.jeevanlink.request.service;

import com.jeevanlink.request.client.DonorClient;
import com.jeevanlink.request.client.HospitalClient;
import com.jeevanlink.request.client.MatcherClient;
import com.jeevanlink.request.client.NotificationClient;
import com.jeevanlink.request.dto.RequestDto;
import com.jeevanlink.request.entity.*;
import com.jeevanlink.request.exception.ApiException;
import com.jeevanlink.request.repository.BloodRequestRepository;
import com.jeevanlink.request.repository.DonorMatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RequestService {

    private final BloodRequestRepository requestRepository;
    private final DonorMatchRepository matchRepository;
    private final HospitalClient hospitalClient;
    private final DonorClient donorClient;
    private final MatcherClient matcherClient;
    private final NotificationClient notificationClient;

    @Transactional
    public RequestDto.Response create(UUID hospitalId, RequestDto.CreateRequest req) {
        BloodRequest r = BloodRequest.builder()
                .hospitalId(hospitalId)
                .bloodGroup(req.bloodGroup())
                .unitsRequired(req.unitsRequired())
                .priority(req.priority())
                .patientName(req.patientName())
                .reason(req.reason())
                .status(RequestStatus.OPEN)
                .build();
        r = requestRepository.save(r);

        // Look up hospital details for matching context
        HospitalClient.HospitalResponse hospital;
        try {
            hospital = hospitalClient.getById(hospitalId);
        } catch (Exception ex) {
            log.warn("Could not fetch hospital details: {}", ex.getMessage());
            hospital = null;
        }

        // Call AI matcher
        List<MatcherClient.MatchedDonor> matches = List.of();
        try {
            matches = matcherClient.findMatches(new MatcherClient.MatchRequest(
                    r.getId(),
                    r.getBloodGroup(),
                    hospital == null ? null : hospital.latitude(),
                    hospital == null ? null : hospital.longitude(),
                    hospital == null ? null : hospital.city()
            ));
        } catch (Exception ex) {
            log.warn("AI matcher unavailable: {}", ex.getMessage());
        }

        // Save matches and fire notifications
        for (MatcherClient.MatchedDonor md : matches) {
            DonorMatch m = matchRepository.save(DonorMatch.builder()
                    .requestId(r.getId())
                    .donorId(md.donorId())
                    .matchScore(md.matchScore())
                    .distanceKm(md.distanceKm())
                    .aiReasoning(md.reasoning())
                    .status(MatchStatus.PENDING)
                    .build());

            safeNotify(md.donorId(), "MATCH_FOUND",
                    "Urgent: " + r.getBloodGroup() + " needed",
                    "A hospital nearby is requesting your blood group. Tap to view and respond.",
                    r.getId());
        }

        return RequestDto.Response.from(r,
                matchRepository.findByRequestIdOrderByMatchScoreDesc(r.getId())
                        .stream().map(RequestDto.MatchResponse::from).toList());
    }

    public List<RequestDto.Response> filter(RequestStatus status, BloodGroup bloodGroup) {
        return requestRepository.filter(status, bloodGroup).stream()
                .map(r -> RequestDto.Response.from(r,
                        matchRepository.findByRequestIdOrderByMatchScoreDesc(r.getId()).stream()
                                .map(RequestDto.MatchResponse::from).toList()))
                .toList();
    }

    public RequestDto.Response getById(UUID id) {
        BloodRequest r = requestRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Request not found"));
        return RequestDto.Response.from(r,
                matchRepository.findByRequestIdOrderByMatchScoreDesc(r.getId())
                        .stream().map(RequestDto.MatchResponse::from).toList());
    }

    public List<RequestDto.Response> hospitalRequests(UUID hospitalId) {
        return requestRepository.findByHospitalIdOrderByCreatedAtDesc(hospitalId).stream()
                .map(r -> RequestDto.Response.from(r,
                        matchRepository.findByRequestIdOrderByMatchScoreDesc(r.getId()).stream()
                                .map(RequestDto.MatchResponse::from).toList()))
                .toList();
    }

    public List<RequestDto.MatchResponse> donorMatches(UUID donorId) {
        return matchRepository.findByDonorIdOrderByMatchedAtDesc(donorId).stream()
                .map(RequestDto.MatchResponse::from).toList();
    }

    @Transactional
    public RequestDto.Response cancel(UUID id, UUID hospitalId) {
        BloodRequest r = ownedBy(id, hospitalId);
        r.setStatus(RequestStatus.CANCELLED);
        return getById(id);
    }

    @Transactional
    public RequestDto.Response fulfill(UUID id, UUID hospitalId) {
        BloodRequest r = ownedBy(id, hospitalId);
        r.setStatus(RequestStatus.FULFILLED);
        r.setFulfilledAt(Instant.now());

        List<DonorMatch> accepted = matchRepository.findByRequestIdAndStatus(id, MatchStatus.ACCEPTED);
        for (DonorMatch m : accepted) {
            m.setStatus(MatchStatus.DONATED);
            try {
                donorClient.logDonation(new DonorClient.LogDonationRequest(
                        m.getDonorId(), hospitalId, id, mapBloodGroup(r.getBloodGroup())));
            } catch (Exception ex) {
                log.warn("logDonation failed for donor {}: {}", m.getDonorId(), ex.getMessage());
            }
            safeNotify(m.getDonorId(), "REQUEST_FULFILLED",
                    "Thank you!", "Your donation has been recorded. Lives saved.", id);
        }
        return getById(id);
    }

    @Transactional
    public RequestDto.MatchResponse accept(UUID matchId, UUID donorId) {
        DonorMatch m = matchRepository.findById(matchId)
                .orElseThrow(() -> ApiException.notFound("Match not found"));
        if (!m.getDonorId().equals(donorId)) throw ApiException.forbidden("Not your match");
        if (m.getStatus() != MatchStatus.PENDING) throw ApiException.badRequest("Match already processed");
        m.setStatus(MatchStatus.ACCEPTED);

        BloodRequest r = requestRepository.findById(m.getRequestId()).orElse(null);
        if (r != null) {
            safeNotify(r.getHospitalId(), "DONOR_ACCEPTED",
                    "A donor has accepted",
                    "A donor has accepted your blood request for " + r.getBloodGroup() + ".",
                    r.getId());
        }
        return RequestDto.MatchResponse.from(m);
    }

    @Transactional
    public RequestDto.MatchResponse decline(UUID matchId, UUID donorId) {
        DonorMatch m = matchRepository.findById(matchId)
                .orElseThrow(() -> ApiException.notFound("Match not found"));
        if (!m.getDonorId().equals(donorId)) throw ApiException.forbidden("Not your match");
        m.setStatus(MatchStatus.DECLINED);
        return RequestDto.MatchResponse.from(m);
    }

    private BloodRequest ownedBy(UUID id, UUID hospitalId) {
        BloodRequest r = requestRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Request not found"));
        if (!r.getHospitalId().equals(hospitalId)) throw ApiException.forbidden("Not your request");
        return r;
    }

    private void safeNotify(UUID userId, String type, String title, String message, UUID requestId) {
        try {
            notificationClient.send(new NotificationClient.NotificationRequest(userId, type, title, message, requestId));
        } catch (Exception ex) {
            log.warn("Notification failed for user {}: {}", userId, ex.getMessage());
        }
    }

    private com.jeevanlink.request.entity.BloodGroup mapBloodGroup(BloodGroup g) {
        return g; // same enum, distinct copy across services — keep cast helper for future divergence
    }
}
