package com.college.assetmanager.controller;

import com.college.assetmanager.entity.Role;
import com.college.assetmanager.entity.User;
import com.college.assetmanager.repository.UserRepository;
import com.college.assetmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService    userService;
    private final UserRepository userRepository;

    @GetMapping
    public List<User> getAllUsers(@RequestParam(required = false) Role role) {
        if (role != null) {
            return userRepository.findByRole(role);
        }
        return userService.getAllUsers();
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String roleStr = body.get("role");
        if (roleStr == null) return ResponseEntity.badRequest().body("Role is required");

        Role role = Role.valueOf(roleStr);
        User user = userRepository.findById(id).orElseThrow();

        // Check if updating own role
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if (user.getEmail().equals(currentUserEmail)) {
            return ResponseEntity.badRequest().body("Cannot update own role");
        }

        user.setRole(role);
        userService.saveUser(user);
        return ResponseEntity.ok(user);
    }

    // Used by the Assign Technician modal to populate the dropdown
    @GetMapping("/technicians")
    public List<User> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN);
    }
}