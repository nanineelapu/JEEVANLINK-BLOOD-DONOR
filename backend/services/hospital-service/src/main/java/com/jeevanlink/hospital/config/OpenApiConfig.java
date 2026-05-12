package com.jeevanlink.hospital.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI().info(new Info()
                .title("JEEVANLINK — Hospital Service")
                .description("Hospital profiles and 8-cell blood inventory")
                .version("1.0.0"));
    }
}
