package com.college.assetmanager.dto;

import com.college.assetmanager.entity.AssetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssetRequestDTO {
    private String name;
    private String category;
    private String serialNo;
    private AssetStatus status;
    private String condition;
    private Boolean borrowable;
    private UUID departmentId;
    private UUID roomId;
}
