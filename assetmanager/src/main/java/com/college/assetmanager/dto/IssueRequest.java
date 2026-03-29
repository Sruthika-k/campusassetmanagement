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
public class IssueRequest {
    private UUID assetId;
    private String description;
    private String priority; // HIGH, MEDIUM, LOW
}
