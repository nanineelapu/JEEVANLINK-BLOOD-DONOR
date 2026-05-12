package com.jeevanlink.request.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI().info(new Info()
                .title("JEEVANLINK — Request Service")
                .description("Blood requests and donor matching workflow")
                .version("1.0.0"));
    }
}
