package com.jeevanlink.user.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeevanlink.user.entity.User;
import com.jeevanlink.user.repository.UserRepository;
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

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ResourceLoader resourceLoader;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Initializing user data from JSON...");
            Resource resource = resourceLoader.getResource("classpath:data/users.json");
            try (InputStream inputStream = resource.getInputStream()) {
                List<User> users = objectMapper.readValue(inputStream, new TypeReference<List<User>>() {});
                userRepository.saveAll(users);
                log.info("Successfully loaded {} users.", users.size());
            } catch (Exception e) {
                log.error("Failed to load user data: {}", e.getMessage());
            }
        } else {
            log.info("User data already present, skipping initialization.");
        }
    }
}
