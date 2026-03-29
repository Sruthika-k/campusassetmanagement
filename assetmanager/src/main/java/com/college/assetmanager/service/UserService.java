package com.college.assetmanager.service;

import com.college.assetmanager.entity.User;
import com.college.assetmanager.entity.Role;
import com.college.assetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;
import com.college.assetmanager.dto.LoginRequest;
import com.college.assetmanager.dto.RegisterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(RegisterRequest request) {
        log.info("Creating user with email: {}", request.getEmail());
        
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Email already registered: {}", request.getEmail());
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Email already registered");
        }
        
        try {
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole(request.getRole() != null ? request.getRole() : Role.STUDENT);
            
            User savedUser = userRepository.save(user);
            log.info("User created successfully: {}", savedUser.getEmail());
            return savedUser;
        } catch (Exception e) {
            log.error("Failed to create user {}: {}", request.getEmail(), e.getMessage(), e);
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR, "Failed to create user");
        }
    }

    public User createUser(User user) {
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        return userRepository.save(user);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User login(LoginRequest request) {
        String email = request.getEmail();
        if (email != null && !email.isEmpty()) {
            log.info("Login attempt for: {}", email);
            
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("Invalid password for: {}", email);
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }

            log.info("User logged in successfully: {}", email);
            return user;
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
    }
}
