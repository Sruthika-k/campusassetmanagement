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
public class AssetResponseDTO {
    private UUID id;
    private String name;
    private String category;
    private String serialNo;
    private String status;
    private String condition;
    private Boolean borrowable;
    private UUID departmentId;
    private String departmentName;
    private UUID roomId;
    private String roomName;
    private String qrCodePath;
    private LocalDateTime createdAt;
}
