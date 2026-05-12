package com.jeevanlink.matcher.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI().info(new Info()
                .title("JEEVANLINK — AI Matcher Service")
                .description("Donor matching algorithm + Gemini reasoning + eligibility chatbot")
                .version("1.0.0"));
    }
}
