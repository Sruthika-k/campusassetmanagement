package com.college.assetmanager.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowRequest {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID assetId;

    private UUID userId;

    private UUID approvedBy;

    @Enumerated(EnumType.STRING)
    private BorrowStatus status;

    private LocalDateTime requestedAt;

    private LocalDateTime borrowedAt;

    private LocalDateTime returnedAt;
}