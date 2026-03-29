package com.college.assetmanager.controller;

import com.college.assetmanager.dto.AuthResponse;
import com.college.assetmanager.dto.LoginRequest;
import com.college.assetmanager.dto.RegisterRequest;
import com.college.assetmanager.entity.User;
import com.college.assetmanager.entity.Role;
import com.college.assetmanager.security.JwtUtil;
import com.college.assetmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        log.info("Registration request received: {}", request.getEmail());
        
        try {
            if (request.getName() == null || request.getName().isBlank()) {
                log.warn("Registration failed: Name is required");
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Name is required");
            }
            
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                log.warn("Registration failed: Email is required");
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Email is required");
            }
            
            if (request.getPassword() == null || request.getPassword().isBlank()) {
                log.warn("Registration failed: Password is required");
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Password is required");
            }
            
            if (request.getRole() == null)
                request.setRole(Role.STUDENT);
            
            log.info("Creating user: {}", request.getEmail());
            User created = userService.createUser(request);
            String role = created.getRole().name();
            String token = jwtUtil.generateToken(
                created.getId().toString(), 
                created.getEmail(), 
                role
            );
            
            log.info("User registered successfully: {}", created.getEmail());
            return ResponseEntity.ok(new AuthResponse(token, created));
        } catch (ResponseStatusException e) {
            log.error("Registration failed for {}: {}", request.getEmail(), e.getReason());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during registration for {}: {}", request.getEmail(), e.getMessage(), e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, "Registration failed");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            if (loginRequest.getEmail() != null && !loginRequest.getEmail().isEmpty()) {
                log.info("Login request received: {}", loginRequest.getEmail());
                User user = userService.login(loginRequest);
                String role = user.getRole() != null ? user.getRole().name() : "USER";
                String token = jwtUtil.generateToken(user.getId().toString(), user.getEmail(), role);
                log.info("User logged in successfully: {}", user.getEmail());
                return ResponseEntity.ok(new AuthResponse(token, user));
            }
            log.warn("Login failed: Email is required");
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Login failed for {}: {}", loginRequest.getEmail(), e.getMessage());
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
    }
}
