package com.jeevanlink.matcher.controller;

import com.jeevanlink.matcher.dto.MatcherDto;
import com.jeevanlink.matcher.service.MatcherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MatcherController {

    private final MatcherService matcherService;

    @PostMapping("/api/matcher/find")
    public List<MatcherDto.MatchedDonor> find(@Valid @RequestBody MatcherDto.MatchRequest req) {
        return matcherService.findMatches(req);
    }

    @PostMapping("/api/ai/eligibility-check")
    public MatcherDto.EligibilityResponse eligibility(@Valid @RequestBody MatcherDto.EligibilityRequest req) {
        return matcherService.checkEligibility(req.donorId());
    }

    @PostMapping("/api/ai/chatbot")
    public MatcherDto.ChatResponse chat(@Valid @RequestBody MatcherDto.ChatRequest req) {
        return matcherService.chat(req);
    }
}
