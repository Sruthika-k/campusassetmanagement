package com.college.assetmanager.service;

import com.college.assetmanager.dto.BorrowResponseDTO;
import com.college.assetmanager.entity.*;
import com.college.assetmanager.repository.AssetRepository;
import com.college.assetmanager.repository.BorrowRepository;
import com.college.assetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRepository borrowRepository;
    private final AssetRepository  assetRepository;
    private final UserRepository   userRepository;
    private final EventService     eventService;

    // ── GET all (for admins) ────────────────────────────────────────────────
    public List<BorrowResponseDTO> getAllBorrowRequests() {
        return borrowRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── GET by user ─────────────────────────────────────────────────────────
    public List<BorrowResponseDTO> getMyBorrowRequests(UUID userId) {
        return borrowRepository.findByUserId(userId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── REQUEST BORROW ──────────────────────────────────────────────────────
    @Transactional
    public BorrowResponseDTO requestBorrow(UUID assetId, UUID userId) {

        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));

        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Asset is not available for borrowing (current status: " + asset.getStatus() + ")");
        }

        BorrowRequest request = BorrowRequest.builder()
                .assetId(assetId)
                .userId(userId)
                .status(BorrowStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();

        BorrowRequest saved = borrowRepository.save(request);

        eventService.log(assetId, userId, EventType.BORROW_REQUESTED,
                "Borrow requested for: " + asset.getName());

        return toDTO(saved);
    }

    // ── APPROVE BORROW ──────────────────────────────────────────────────────
    @Transactional
    public BorrowResponseDTO approve(UUID borrowId, UUID approverId) {

        BorrowRequest req = borrowRepository.findById(borrowId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Borrow request not found"));

        if (req.getStatus() != BorrowStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING requests can be approved");
        }

        req.setStatus(BorrowStatus.APPROVED);
        req.setApprovedBy(approverId);
        req.setBorrowedAt(LocalDateTime.now());
        BorrowRequest saved = borrowRepository.save(req);

        Asset asset = assetRepository.findById(req.getAssetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));
        asset.setStatus(AssetStatus.BORROWED);
        assetRepository.save(asset);

        eventService.log(req.getAssetId(), approverId, EventType.BORROW_APPROVED, "Borrow approved");

        return toDTO(saved);
    }

    // ── REJECT BORROW ───────────────────────────────────────────────────────
    @Transactional
    public BorrowResponseDTO reject(UUID borrowId, UUID rejectedById) {

        BorrowRequest req = borrowRepository.findById(borrowId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Borrow request not found"));

        if (req.getStatus() != BorrowStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PENDING requests can be rejected");
        }

        req.setStatus(BorrowStatus.REJECTED);
        BorrowRequest saved = borrowRepository.save(req);

        eventService.log(req.getAssetId(), rejectedById, EventType.BORROW_REJECTED, "Borrow rejected");

        return toDTO(saved);
    }

    // ── RETURN ASSET ────────────────────────────────────────────────────────
    @Transactional
    public BorrowResponseDTO returnAsset(UUID borrowId, UUID returningUserId) {

        BorrowRequest req = borrowRepository.findById(borrowId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Borrow request not found"));

        if (req.getStatus() != BorrowStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only APPROVED borrows can be returned");
        }

        req.setStatus(BorrowStatus.RETURNED);
        req.setReturnedAt(LocalDateTime.now());
        BorrowRequest saved = borrowRepository.save(req);

        Asset asset = assetRepository.findById(req.getAssetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);

        eventService.log(req.getAssetId(), returningUserId, EventType.BORROW_RETURNED, "Asset returned");

        return toDTO(saved);
    }

    // ── MAPPING ─────────────────────────────────────────────────────────────
    private BorrowResponseDTO toDTO(BorrowRequest req) {
        String assetName = null;
        try {
            assetName = assetRepository.findById(req.getAssetId())
                    .map(Asset::getName).orElse("Unknown Asset");
        } catch (Exception ignored) {}

        String requesterName  = null;
        String requesterEmail = null;
        String requesterRole  = null;
        try {
            User user = userRepository.findById(req.getUserId()).orElse(null);
            if (user != null) {
                requesterName  = user.getName();
                requesterEmail = user.getEmail();
                requesterRole  = user.getRole() != null ? user.getRole().name() : null;
            }
        } catch (Exception ignored) {}

        return BorrowResponseDTO.builder()
                .id(req.getId())
                .assetId(req.getAssetId())
                .assetName(assetName)
                .requestedById(req.getUserId())
                .requestedByName(requesterName)
                .requestedByEmail(requesterEmail)
                .requestedByRole(requesterRole)
                .status(req.getStatus() != null ? req.getStatus().name() : null)
                .requestedAt(req.getRequestedAt())
                .borrowedAt(req.getBorrowedAt())
                .returnedAt(req.getReturnedAt())
                .build();
    }
}