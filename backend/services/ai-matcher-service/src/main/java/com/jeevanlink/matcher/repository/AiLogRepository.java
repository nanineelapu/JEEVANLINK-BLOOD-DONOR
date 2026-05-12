package com.jeevanlink.matcher.repository;

import com.jeevanlink.matcher.entity.AiLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiLogRepository extends JpaRepository<AiLog, UUID> {}
