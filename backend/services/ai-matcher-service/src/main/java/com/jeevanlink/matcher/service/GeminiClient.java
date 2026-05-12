package com.jeevanlink.matcher.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Thin wrapper around Google Gemini's generateContent endpoint.
 * If no API key is configured, callers should fall back to canned responses.
 */
@Component
@Slf4j
public class GeminiClient {

    private final String apiKey;
    private final String model;
    private final String baseUrl;
    private final RestClient http;
    private final ObjectMapper mapper = new ObjectMapper();

    public GeminiClient(
            @Value("${app.gemini.api-key:}") String apiKey,
            @Value("${app.gemini.model:gemini-pro}") String model,
            @Value("${app.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
        this.http = RestClient.builder().build();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Sends `prompt` to Gemini and returns the model's text response.
     * Returns null if the API key is unset or the call fails.
     */
    public String generate(String prompt) {
        if (!isConfigured()) {
            log.debug("Gemini API key not configured — skipping AI call");
            return null;
        }
        try {
            ObjectNode root = mapper.createObjectNode();
            ArrayNode contents = root.putArray("contents");
            ObjectNode contentItem = contents.addObject();
            ArrayNode parts = contentItem.putArray("parts");
            parts.addObject().put("text", prompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = "%s/models/%s:generateContent?key=%s".formatted(baseUrl, model, apiKey);

            String response = http.post()
                    .uri(url)
                    .headers(h -> h.addAll(headers))
                    .body(root.toString())
                    .retrieve()
                    .body(String.class);

            if (response == null) return null;
            JsonNode node = mapper.readTree(response);
            JsonNode text = node.at("/candidates/0/content/parts/0/text");
            return text.isMissingNode() ? null : text.asText();
        } catch (Exception ex) {
            log.warn("Gemini call failed: {}", ex.getMessage());
            return null;
        }
    }
}
