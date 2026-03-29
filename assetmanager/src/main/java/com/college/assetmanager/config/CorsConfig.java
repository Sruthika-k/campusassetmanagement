package com.college.assetmanager.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Value("${FRONTEND_URL:http://localhost:5173}")
    @SuppressWarnings("unused")
    private String frontendUrl;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow specific origins for production
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedOrigin("https://campusassetmanagement.vercel.app");
        
        // Allow all origins for development (backup)
        config.addAllowedOriginPattern("*");
        
        // Allow all methods
        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE",
                "OPTIONS", "PATCH", "HEAD"
        ));
        
        // Allow all headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Enable credentials
        config.setAllowCredentials(true);
        
        // Pre-flight cache duration
        config.setMaxAge(3600L);
        
        // Expose headers if needed
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
