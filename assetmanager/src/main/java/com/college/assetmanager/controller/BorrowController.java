package com.college.assetmanager.controller;

import com.college.assetmanager.dto.BorrowResponseDTO;
import com.college.assetmanager.entity.User;
import com.college.assetmanager.repository.UserRepository;
import com.college.assetmanager.service.BorrowService;
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
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService  borrowService;
    private final UserRepository userRepository;

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    // ── GET /api/borrow  (role-aware) ─────────────────────────────────────
    @GetMapping
    public List<BorrowResponseDTO> getBorrowRequests(Authentication auth) {
        User user = currentUser(auth);
        String role = user.getRole().name();
        if (role.equals("ADMIN") || role.equals("LAB_INCHARGE")) {
            return borrowService.getAllBorrowRequests();
        }
        return borrowService.getMyBorrowRequests(user.getId());
    }

    // ── GET /api/borrow/my ────────────────────────────────────────────────
    @GetMapping("/my")
    public List<BorrowResponseDTO> getMyBorrowRequests(Authentication auth) {
        User user = currentUser(auth);
        return borrowService.getMyBorrowRequests(user.getId());
    }

    // ── POST /api/borrow/request   body: { "assetId": "..." } ─────────────
    @PostMapping("/request")
    public ResponseEntity<BorrowResponseDTO> requestBorrow(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        UUID assetId = UUID.fromString(body.get("assetId"));
        User user = currentUser(auth);
        return ResponseEntity.ok(borrowService.requestBorrow(assetId, user.getId()));
    }

    // ── POST /api/borrow/{id}/approve  (ADMIN, LAB_INCHARGE) ──────────────
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','LAB_INCHARGE')")
    public ResponseEntity<BorrowResponseDTO> approve(
            @PathVariable UUID id,
            Authentication auth) {
        User user = currentUser(auth);
        return ResponseEntity.ok(borrowService.approve(id, user.getId()));
    }

    // ── POST /api/borrow/{id}/reject  (ADMIN, LAB_INCHARGE) ───────────────
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','LAB_INCHARGE')")
    public ResponseEntity<BorrowResponseDTO> reject(
            @PathVariable UUID id,
            Authentication auth) {
        User user = currentUser(auth);
        return ResponseEntity.ok(borrowService.reject(id, user.getId()));
    }

    // ── POST /api/borrow/{id}/return  (ADMIN, LAB_INCHARGE) ───────────────
    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('ADMIN','LAB_INCHARGE')")
    public ResponseEntity<BorrowResponseDTO> returnAsset(
            @PathVariable UUID id,
            Authentication auth) {
        User user = currentUser(auth);
        return ResponseEntity.ok(borrowService.returnAsset(id, user.getId()));
    }
}