package com.jeevanlink.request.client;

import com.jeevanlink.request.entity.BloodGroup;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "ai-matcher-service")
public interface MatcherClient {

    record MatchRequest(UUID requestId, BloodGroup bloodGroup, Double hospitalLat, Double hospitalLng, String city) {}
    record MatchedDonor(UUID donorId, Double matchScore, Double distanceKm, String reasoning) {}

    @PostMapping("/api/matcher/find")
    List<MatchedDonor> findMatches(@RequestBody MatchRequest req);
}
