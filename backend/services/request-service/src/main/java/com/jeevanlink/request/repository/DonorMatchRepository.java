package com.jeevanlink.request.repository;

import com.jeevanlink.request.entity.DonorMatch;
import com.jeevanlink.request.entity.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DonorMatchRepository extends JpaRepository<DonorMatch, UUID> {
    List<DonorMatch> findByRequestIdOrderByMatchScoreDesc(UUID requestId);
    List<DonorMatch> findByDonorIdOrderByMatchedAtDesc(UUID donorId);
    List<DonorMatch> findByRequestIdAndStatus(UUID requestId, MatchStatus status);
}
