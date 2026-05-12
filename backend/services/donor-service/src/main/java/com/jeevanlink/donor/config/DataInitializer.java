package com.jeevanlink.donor.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeevanlink.donor.entity.Donor;
import com.jeevanlink.donor.repository.DonorRepository;
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

    private final DonorRepository donorRepository;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;

    @Override
    public void run(String... args) throws Exception {
        if (donorRepository.count() == 0) {
            log.info("Initializing donor data from JSON...");
            Resource resource = resourceLoader.getResource("classpath:data/donors.json");
            try (InputStream inputStream = resource.getInputStream()) {
                List<Donor> donors = objectMapper.readValue(inputStream, new TypeReference<List<Donor>>() {});
                donorRepository.saveAll(donors);
                log.info("Successfully loaded {} donors.", donors.size());
            } catch (Exception e) {
                log.error("Failed to load donor data: {}", e.getMessage());
            }
        } else {
            log.info("Donor data already present, skipping initialization.");
        }
    }
}
