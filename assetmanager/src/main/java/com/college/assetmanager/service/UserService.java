package com.college.assetmanager.service;

import com.college.assetmanager.entity.User;
import com.college.assetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import com.college.assetmanager.dto.LoginRequest;
import com.college.assetmanager.dto.RegisterRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(RegisterRequest request) {
        String email = request.getEmail();
        if (email == null || email.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        User user = User.builder()
                .name(request.getName())
                .email(email)
                .password(request.getPassword())
                .role(request.getRole() != null ? request.getRole() : com.college.assetmanager.entity.Role.USER)
                .build();
        return createUser(user);
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
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
            }

            return user;
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
    }
}
