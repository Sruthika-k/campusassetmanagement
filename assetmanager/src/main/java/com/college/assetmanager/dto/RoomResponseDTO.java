package com.college.assetmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponseDTO {
    private UUID id;
    private String name;
    private UUID departmentId;
    private String departmentName;
    private long assetCount;
}
