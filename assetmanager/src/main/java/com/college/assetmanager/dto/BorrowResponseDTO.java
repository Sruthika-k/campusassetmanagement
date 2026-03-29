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
public class BorrowResponseDTO {
    private UUID id;
    private UUID assetId;
    private String assetName;
    private UUID requestedById;
    private String requestedByName;
    private String requestedByEmail;
    private String requestedByRole;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime borrowedAt;
    private LocalDateTime returnedAt;
}
