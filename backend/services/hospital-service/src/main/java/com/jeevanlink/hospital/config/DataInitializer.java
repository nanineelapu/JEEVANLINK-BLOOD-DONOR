package com.jeevanlink.hospital.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeevanlink.hospital.entity.Hospital;
import com.jeevanlink.hospital.repository.HospitalRepository;
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

    private final HospitalRepository hospitalRepository;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;

    @Override
    public void run(String... args) throws Exception {
        if (hospitalRepository.count() == 0) {
            log.info("Initializing hospital data from JSON...");
            Resource resource = resourceLoader.getResource("classpath:data/hospitals.json");
            try (InputStream inputStream = resource.getInputStream()) {
                List<Hospital> hospitals = objectMapper.readValue(inputStream, new TypeReference<List<Hospital>>() {});
                hospitalRepository.saveAll(hospitals);
                log.info("Successfully loaded {} hospitals.", hospitals.size());
            } catch (Exception e) {
                log.error("Failed to load hospital data: {}", e.getMessage());
            }
        } else {
            log.info("Hospital data already present, skipping initialization.");
        }
    }
}
