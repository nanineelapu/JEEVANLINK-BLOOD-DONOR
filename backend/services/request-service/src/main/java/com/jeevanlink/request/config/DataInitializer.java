package com.jeevanlink.request.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeevanlink.request.entity.BloodRequest;
import com.jeevanlink.request.repository.BloodRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import java.io.InputStream;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final BloodRequestRepository bloodRequestRepository;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;

    @Override
    public void run(String... args) throws Exception {
        if (bloodRequestRepository.count() == 0) {
            log.info("Initializing blood request data from JSON...");
            Resource resource = resourceLoader.getResource("classpath:data/requests.json");
            try (InputStream inputStream = resource.getInputStream()) {
                List<BloodRequest> requests = objectMapper.readValue(inputStream, new TypeReference<List<BloodRequest>>() {});
                bloodRequestRepository.saveAll(requests);
                log.info("Successfully loaded {} blood requests.", requests.size());
            } catch (Exception e) {
                log.error("Failed to load blood request data: {}", e.getMessage());
            }
        } else {
            log.info("Blood request data already present, skipping initialization.");
        }
    }
}
