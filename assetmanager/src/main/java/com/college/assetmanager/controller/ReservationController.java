package com.college.assetmanager.controller;

import com.college.assetmanager.entity.Reservation;
import com.college.assetmanager.entity.User;
import com.college.assetmanager.repository.UserRepository;
import com.college.assetmanager.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository      userRepository;

    // ── GET all reservations ──────────────────────────────────────────────
    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }

    // ── GET reservations for a specific asset ─────────────────────────────
    @GetMapping("/asset/{assetId}")
    public List<Reservation> getByAsset(@PathVariable UUID assetId) {
        return reservationService.getByAsset(assetId);
    }

    // ── GET my reservations ───────────────────────────────────────────────
    @GetMapping("/my")
    public List<Reservation> getMyReservations(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return reservationService.getMyReservations(user.getId());
    }

    // ── POST /api/reservations   body: { assetId, startTime, endTime } ────
    //   startTime / endTime in ISO-8601 format: "2026-03-15T09:00:00"
    @PostMapping
    public ResponseEntity<Reservation> createReservation(
            @RequestBody Map<String, String> body,
            Authentication auth) {

        UUID assetId       = UUID.fromString(body.get("assetId"));
        LocalDateTime start = LocalDateTime.parse(body.get("startTime"));
        LocalDateTime end   = LocalDateTime.parse(body.get("endTime"));
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return ResponseEntity.ok(
                reservationService.createReservation(assetId, user.getId(), start, end));
    }

    // ── DELETE /api/reservations/{id}  → cancel ───────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Reservation> cancelReservation(
            @PathVariable UUID id,
            Authentication auth) {

        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return ResponseEntity.ok(
                reservationService.cancelReservation(id, user.getId(), isAdmin));
    }
}
