package com.college.assetmanager.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DotenvConfig {

    private static final Logger logger = LoggerFactory.getLogger(DotenvConfig.class);

    @PostConstruct
    public void configure() {
        try {
            // Load .env file from project root
            Dotenv dotenv = Dotenv.configure()
                    .filename(".env")
                    .ignoreIfMissing()
                    .load();
            
            logger.info("Attempting to load .env file...");
            
            // Check if DATABASE_URL is loaded
            String dbUrl = dotenv.get("DATABASE_URL");
            logger.info("DATABASE_URL from .env: {}", dbUrl);
            
            // Set system properties for Spring Boot to use
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                System.setProperty(key, value);
                logger.info("Loaded environment variable: {} = {}", key, value);
            });
            
            logger.info("Dotenv configuration loaded successfully");
        } catch (Exception e) {
            logger.error("Failed to load .env file: {}", e.getMessage(), e);
        }
    }
}
