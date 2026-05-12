package com.jeevanlink.matcher.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeevanlink.matcher.client.DonorClient;
import com.jeevanlink.matcher.dto.MatcherDto;
import com.jeevanlink.matcher.entity.AiLog;
import com.jeevanlink.matcher.entity.BloodGroup;
import com.jeevanlink.matcher.repository.AiLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatcherService {

    private static final int TOP_N = 5;
    private static final long ELIGIBILITY_DAYS = 90L;
    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double MAX_DISTANCE_KM = 50.0;

    private final DonorClient donorClient;
    private final GeminiClient gemini;
    private final AiLogRepository logRepo;
    private final ObjectMapper mapper = new ObjectMapper();

    public List<MatcherDto.MatchedDonor> findMatches(MatcherDto.MatchRequest req) {
        // 1) Fetch compatible donors
        List<BloodGroup> compatibleGroups = req.bloodGroup().compatibleDonors();
        List<DonorClient.DonorResponse> candidates;
        try {
            candidates = donorClient.search(compatibleGroups, null, true);
        } catch (Exception ex) {
            log.warn("donor search failed: {}", ex.getMessage());
            return List.of();
        }

        // 2) Filter eligible
        List<DonorClient.DonorResponse> eligible = candidates.stream()
                .filter(d -> d.available() && isEligible(d))
                .toList();

        // 3) Score and rank
        List<Scored> scored = eligible.stream()
                .map(d -> score(d, req))
                .sorted(Comparator.comparingDouble((Scored s) -> s.score).reversed())
                .limit(TOP_N)
                .toList();

        if (scored.isEmpty()) return List.of();

        // 4) Optional AI reasoning
        Map<UUID, String> reasonings = aiReasonings(scored, req);

        return scored.stream()
                .map(s -> new MatcherDto.MatchedDonor(
                        s.donor.userId(),
                        round(s.score * 100.0),
                        round(s.distanceKm),
                        reasonings.getOrDefault(s.donor.userId(), defaultReasoning(s, req))))
                .toList();
    }

    public MatcherDto.EligibilityResponse checkEligibility(UUID donorId) {
        DonorClient.DonorResponse d;
        try {
            d = donorClient.getById(donorId);
        } catch (Exception ex) {
            return new MatcherDto.EligibilityResponse(false, "Donor profile not found", null);
        }

        if (!d.available()) {
            return new MatcherDto.EligibilityResponse(false, "You have marked yourself unavailable.", null);
        }
        if (d.age() == null || d.age() < 18 || d.age() > 65) {
            return new MatcherDto.EligibilityResponse(false,
                    "Donors must be between 18 and 65 years of age.", null);
        }
        if (d.lastDonationDate() == null) {
            return new MatcherDto.EligibilityResponse(true,
                    "You're eligible — you have no prior donation on record.", null);
        }
        Instant next = d.lastDonationDate().plus(ELIGIBILITY_DAYS, ChronoUnit.DAYS);
        if (Instant.now().isBefore(next)) {
            return new MatcherDto.EligibilityResponse(false,
                    "You must wait at least 90 days between donations.", next);
        }
        return new MatcherDto.EligibilityResponse(true,
                "You're eligible to donate.", next);
    }

    public MatcherDto.ChatResponse chat(MatcherDto.ChatRequest req) {
        String prompt = """
                You are JEEVANLINK's donor eligibility assistant. Answer the user's question
                briefly (max 80 words) using these blood donation rules:
                - Donors must be 18 to 65 years old.
                - Minimum gap between two whole-blood donations is 90 days.
                - Donors must weigh 50 kg or more and be in good health.
                - Donors with recent infections, surgery, or tattoos in the past 6 months
                  should consult their doctor.
                Answer in plain text, no markdown formatting.

                User question: %s
                """.formatted(req.message());

        String response = gemini.generate(prompt);
        if (response == null) {
            response = """
                    Quick eligibility check (offline assistant):
                    • Age 18–65: yes
                    • At least 90 days since last donation: required
                    • Healthy, no recent illness: required
                    • Weight 50kg or more: recommended
                    Please consult your nearest blood bank for personal advice.
                    """;
        }
        logRepo.save(AiLog.builder().operation("CHATBOT").prompt(req.message()).response(response).build());
        return new MatcherDto.ChatResponse(response.trim());
    }

    // ---- internal ----

    private Map<UUID, String> aiReasonings(List<Scored> scored, MatcherDto.MatchRequest req) {
        if (!gemini.isConfigured()) return Map.of();

        StringBuilder donorList = new StringBuilder();
        for (int i = 0; i < scored.size(); i++) {
            Scored s = scored.get(i);
            donorList.append(String.format(
                    "%d) id=%s, bloodGroup=%s, distanceKm=%.1f, totalDonations=%d%n",
                    i + 1, s.donor.userId(), s.donor.bloodGroup().pretty(),
                    s.distanceKm, s.donor.totalDonations() == null ? 0 : s.donor.totalDonations()));
        }

        String prompt = """
                A hospital needs blood group %s. Below are the top candidate donors.
                Return a JSON array (no markdown fences) of objects with keys
                "donorId" and "reasoning". Each reasoning must be ONE short sentence
                (max 20 words) explaining why this donor is a strong match
                (mention distance and donation history when relevant).

                Donors:
                %s

                Output JSON array only.
                """.formatted(req.bloodGroup().pretty(), donorList);

        String raw = gemini.generate(prompt);
        logRepo.save(AiLog.builder().operation("MATCH_REASONING").prompt(prompt).response(raw).build());
        if (raw == null) return Map.of();

        String cleaned = raw.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```(json)?", "").replaceAll("```$", "").trim();
        }
        try {
            List<Map<String, String>> parsed = mapper.readValue(cleaned, new TypeReference<>() {});
            Map<UUID, String> out = new HashMap<>();
            for (Map<String, String> entry : parsed) {
                try {
                    out.put(UUID.fromString(entry.get("donorId")), entry.get("reasoning"));
                } catch (Exception ignored) { }
            }
            return out;
        } catch (Exception ex) {
            log.warn("AI reasoning parse failed: {}", ex.getMessage());
            return Map.of();
        }
    }

    private Scored score(DonorClient.DonorResponse d, MatcherDto.MatchRequest req) {
        double distance = distanceKm(d, req);
        double proximity = distance <= 0 ? 1.0 : Math.max(0.0, 1.0 - Math.min(distance, MAX_DISTANCE_KM) / MAX_DISTANCE_KM);

        double recency;
        if (d.lastDonationDate() == null) {
            recency = 1.0;
        } else {
            long days = ChronoUnit.DAYS.between(d.lastDonationDate(), Instant.now());
            recency = Math.min(1.0, days / 365.0);
        }
        double score = (proximity * 0.7) + (recency * 0.3);
        return new Scored(d, distance, score);
    }

    private double distanceKm(DonorClient.DonorResponse d, MatcherDto.MatchRequest req) {
        if (d.latitude() == null || d.longitude() == null
                || req.hospitalLat() == null || req.hospitalLng() == null) {
            return MAX_DISTANCE_KM;
        }
        double lat1 = Math.toRadians(d.latitude());
        double lat2 = Math.toRadians(req.hospitalLat());
        double dLat = lat2 - lat1;
        double dLon = Math.toRadians(req.hospitalLng() - d.longitude());
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    private boolean isEligible(DonorClient.DonorResponse d) {
        if (d.age() == null || d.age() < 18 || d.age() > 65) return false;
        if (d.lastDonationDate() == null) return true;
        return d.lastDonationDate().isBefore(Instant.now().minus(ELIGIBILITY_DAYS, ChronoUnit.DAYS));
    }

    private String defaultReasoning(Scored s, MatcherDto.MatchRequest req) {
        return String.format(
                "%s donor, ~%.1f km from the hospital, %d prior donations — strong proximity and reliability match.",
                s.donor.bloodGroup().pretty(),
                s.distanceKm,
                s.donor.totalDonations() == null ? 0 : s.donor.totalDonations());
    }

    private static double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private record Scored(DonorClient.DonorResponse donor, double distanceKm, double score) {}
}
