package com.college.assetmanager.repository;

import com.college.assetmanager.entity.Reservation;
import com.college.assetmanager.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    List<Reservation> findByAssetId(UUID assetId);

    /**
     * Overlap check: an existing ACTIVE reservation overlaps the requested window if
     *   existing.startTime < requestedEnd  AND  existing.endTime > requestedStart
     */
    @Query("""
        SELECT r FROM Reservation r
        WHERE r.assetId   = :assetId
          AND r.status    = :status
          AND r.startTime < :endTime
          AND r.endTime   > :startTime
    """)
    List<Reservation> findOverlapping(
            @Param("assetId")   UUID assetId,
            @Param("status")    ReservationStatus status,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime")   LocalDateTime endTime
    );

    List<Reservation> findByReservedBy(UUID userId);
}
