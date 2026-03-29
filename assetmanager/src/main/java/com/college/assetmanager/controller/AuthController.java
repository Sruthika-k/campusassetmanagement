package com.college.assetmanager.controller;

import com.college.assetmanager.dto.AuthResponse;
import com.college.assetmanager.dto.LoginRequest;
import com.college.assetmanager.dto.RegisterRequest;
import com.college.assetmanager.entity.User;
import com.college.assetmanager.entity.Role;
import com.college.assetmanager.security.JwtUtil;
import com.college.assetmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        
        if (request.getName() == null || request.getName().isBlank())
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Name is required");
        
        if (request.getEmail() == null || request.getEmail().isBlank())
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Email is required");
        
        if (request.getPassword() == null || request.getPassword().isBlank())
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Password is required");
        
        if (request.getRole() == null)
            request.setRole(Role.STUDENT);
        
        User created = userService.createUser(request);
        String role = created.getRole().name();
        String token = jwtUtil.generateToken(
            created.getId().toString(), 
            created.getEmail(), 
            role
        );
        return ResponseEntity.ok(new AuthResponse(token, created));
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
