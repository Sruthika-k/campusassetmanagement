package com.college.assetmanager.service;

import com.college.assetmanager.entity.EventType;
import com.college.assetmanager.entity.Reservation;
import com.college.assetmanager.entity.ReservationStatus;
import com.college.assetmanager.repository.AssetRepository;
import com.college.assetmanager.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final AssetRepository       assetRepository;
    private final EventService          eventService;

    // ── GET all ─────────────────────────────────────────────────────────────
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    // ── GET by asset ─────────────────────────────────────────────────────────
    public List<Reservation> getByAsset(UUID assetId) {
        return reservationRepository.findByAssetId(assetId);
    }

    // ── GET my reservations ──────────────────────────────────────────────────
    public List<Reservation> getMyReservations(UUID userId) {
        return reservationRepository.findByReservedBy(userId);
    }

    // ── CREATE ───────────────────────────────────────────────────────────────
    @Transactional
    public Reservation createReservation(UUID assetId, UUID userId,
                                         LocalDateTime startTime, LocalDateTime endTime) {

        // Validate window
        if (!endTime.isAfter(startTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "End time must be after start time");
        }

        // Asset must exist
        assetRepository.findById(assetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));

        // Conflict detection
        List<Reservation> conflicts = reservationRepository.findOverlapping(
                assetId, ReservationStatus.ACTIVE, startTime, endTime);

        if (!conflicts.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Time slot already booked — overlaps with " + conflicts.size() +
                    " existing reservation(s)");
        }

        Reservation reservation = Reservation.builder()
                .assetId(assetId)
                .reservedBy(userId)
                .startTime(startTime)
                .endTime(endTime)
                .status(ReservationStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        Reservation saved = reservationRepository.save(reservation);

        eventService.log(assetId, userId, EventType.RESERVATION_CREATED,
                "Reserved from " + startTime + " to " + endTime);

        return saved;
    }

    // ── CANCEL ───────────────────────────────────────────────────────────────
    @Transactional
    public Reservation cancelReservation(UUID reservationId, UUID requestingUserId, boolean isAdmin) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Reservation not found"));

        // Only owner or ADMIN may cancel
        if (!isAdmin && !reservation.getReservedBy().equals(requestingUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only cancel your own reservations");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Reservation is already cancelled");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation saved = reservationRepository.save(reservation);

        eventService.log(reservation.getAssetId(), requestingUserId,
                EventType.RESERVATION_CANCELLED, "Reservation cancelled");

        return saved;
    }
}
