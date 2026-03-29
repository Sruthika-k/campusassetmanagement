package com.college.assetmanager.controller;

import com.college.assetmanager.dto.AuthResponse;
import com.college.assetmanager.dto.LoginRequest;
import com.college.assetmanager.dto.RegisterRequest;
import com.college.assetmanager.entity.User;
import com.college.assetmanager.security.JwtUtil;
import com.college.assetmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            User createdUser = userService.createUser(request);
            String role = createdUser.getRole() != null ? createdUser.getRole().name() : "USER";
            String token = jwtUtil.generateToken(createdUser.getId().toString(), createdUser.getEmail(), role);
            return ResponseEntity.ok(new AuthResponse(token, createdUser));
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        if (loginRequest.getEmail() != null && !loginRequest.getEmail().isEmpty()) {
            User user = userService.login(loginRequest);
            String role = user.getRole() != null ? user.getRole().name() : "USER";
            String token = jwtUtil.generateToken(user.getId().toString(), user.getEmail(), role);
            return ResponseEntity.ok(new AuthResponse(token, user));
        }
        return ResponseEntity.badRequest().build();
    }
}
