package com.college.assetmanager.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScanResponseDTO {
    private String id;
    private String name;
    private String category;
    private String serialNo;
    private String status;
    private String condition;
    private Boolean borrowable;
    private String department;
    private String room;
    private String qrCodePath;
    private String qrCodeUrl;
    private String qrCodeBase64;
}
