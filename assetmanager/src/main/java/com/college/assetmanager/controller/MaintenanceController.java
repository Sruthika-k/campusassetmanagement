package com.college.assetmanager.controller;

import com.college.assetmanager.dto.IssueRequest;
import com.college.assetmanager.dto.MaintenanceResponseDTO;
import com.college.assetmanager.entity.User;
import com.college.assetmanager.repository.UserRepository;
import com.college.assetmanager.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final UserRepository     userRepository;

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // ── GET /api/issues  (role-aware) ─────────────────────────────────────
    @GetMapping
    public List<MaintenanceResponseDTO> getIssues(Authentication auth) {
        User user = currentUser(auth);
        String role = user.getRole().name();
        if (role.equals("ADMIN") || role.equals("LAB_INCHARGE")) {
            return maintenanceService.getAllIssues();
        } else if (role.equals("TECHNICIAN")) {
            return maintenanceService.getMyIssues(user.getId());
        } else {
            // FACULTY, STUDENT — see their own reported issues
            return maintenanceService.getReportedBy(user.getId());
        }
    }

    // ── GET /api/issues/my ────────────────────────────────────────────────
    @GetMapping("/my")
    public List<MaintenanceResponseDTO> getMyIssues(Authentication auth) {
        User user = currentUser(auth);
        String role = user.getRole().name();
        if (role.equals("TECHNICIAN")) {
            return maintenanceService.getMyIssues(user.getId());
        }
        return maintenanceService.getReportedBy(user.getId());
    }

    // ── POST /api/issues  (any role except TECHNICIAN) ─────────────────────
    @PostMapping
    @PreAuthorize("!hasRole('TECHNICIAN')")
    public ResponseEntity<MaintenanceResponseDTO> reportIssue(
            @RequestBody IssueRequest request,
            Authentication auth) {
        User user = currentUser(auth);
        return ResponseEntity.ok(maintenanceService.reportIssue(request, user.getId()));
    }

    // ── POST /api/issues/{id}/assign  (ADMIN only) ─────────────────────────
    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MaintenanceResponseDTO> assignTechnician(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        UUID technicianId = UUID.fromString(body.get("technicianId"));
        User user = currentUser(auth);
        return ResponseEntity.ok(maintenanceService.assignTechnician(id, technicianId, user.getId()));
    }

    // ── POST /api/issues/{id}/resolve  (TECHNICIAN or ADMIN) ──────────────
    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    public ResponseEntity<MaintenanceResponseDTO> resolveIssue(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication auth) {
        String notes = body != null ? body.getOrDefault("notes", "") : "";
        User user = currentUser(auth);
        return ResponseEntity.ok(maintenanceService.resolveIssue(id, user.getId(), notes));
    }
}