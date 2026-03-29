package com.college.assetmanager.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)")
    private UUID id;

    private UUID assetId;

    private UUID reportedBy;

    private String description;

    private String priority; // HIGH, MEDIUM, LOW

    @Enumerated(EnumType.STRING)
    private MaintenanceStatus status;

    private UUID technicianId;

    private UUID assignedById;

    private String resolvedNotes;

    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;
}