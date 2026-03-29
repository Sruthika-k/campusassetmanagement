package com.college.assetmanager;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

@SpringBootApplication
@Slf4j
public class AssetmanagerApplication {

	public static void main(String[] args) {
		log.info("Starting AssetFlow Backend Application...");
		
		try {
			var app = SpringApplication.run(AssetmanagerApplication.class, args);
			Environment env = app.getEnvironment();
			String port = env.getProperty("server.port", "8080");
			String[] activeProfiles = env.getActiveProfiles();
			
			log.info("✅ AssetFlow Backend started successfully!");
			log.info("🌐 Server running on port: {}", port);
			log.info("📊 Health check available at: http://localhost:{}/health", port);
			log.info("🔐 Auth endpoints available at: http://localhost:{}/api/auth", port);
			log.info("📋 Active profiles: {}", activeProfiles.length > 0 ? String.join(", ", activeProfiles) : "default");
			
		} catch (Exception e) {
			log.error("❌ Failed to start AssetFlow Backend: {}", e.getMessage(), e);
			System.exit(1);
		}
	}

}
