package com.college.assetmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceResponseDTO {
    private UUID id;
    private UUID assetId;
    private String assetName;
    private String description;
    private String priority;
    private String status;
    private UUID reportedById;
    private String reportedByName;
    private UUID technicianId;
    private String technicianName;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String resolvedNotes;
}
