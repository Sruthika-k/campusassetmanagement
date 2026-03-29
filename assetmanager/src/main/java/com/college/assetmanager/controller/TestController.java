package com.college.assetmanager.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@Slf4j
public class TestController {

    @GetMapping("/cors")
    public ResponseEntity<Map<String, String>> testCors(HttpServletRequest request) {
        log.info("CORS test request from: {}", request.getHeader("Origin"));
        log.info("Request method: {}", request.getMethod());
        log.info("Request headers: {}", request.getHeader("Content-Type"));
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "CORS test successful");
        response.put("origin", request.getHeader("Origin"));
        response.put("method", request.getMethod());
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        return ResponseEntity.ok(response);
    }

    @Options("/cors")
    public ResponseEntity<Void> testOptions(HttpServletRequest request) {
        log.info("OPTIONS request from: {}", request.getHeader("Origin"));
        return ResponseEntity.ok().build();
    }
}
