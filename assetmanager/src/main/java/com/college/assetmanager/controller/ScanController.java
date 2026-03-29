package com.college.assetmanager.controller;

import com.college.assetmanager.dto.ScanResponseDTO;
import com.college.assetmanager.entity.Asset;
import com.college.assetmanager.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/scan")
@RequiredArgsConstructor
public class ScanController {

    private final AssetService assetService;

    @GetMapping("/{assetId}")
    public ResponseEntity<ScanResponseDTO> scanAsset(@PathVariable UUID assetId) {
        Asset asset = assetService.getAssetForPublicScan(assetId);

        String path = asset.getQrCodePath();
        String qrCodeUrl;
        if (path != null && path.startsWith("data:")) {
            qrCodeUrl = path;
        } else if (asset.getQrCodeBase64() != null && !asset.getQrCodeBase64().isBlank()) {
            qrCodeUrl = "data:image/png;base64," + asset.getQrCodeBase64();
        } else {
            qrCodeUrl = assetService.qrImageUrlForAsset(asset);
        }

        ScanResponseDTO dto = ScanResponseDTO.builder()
                .id(asset.getId().toString())
                .name(asset.getName())
                .category(asset.getCategory())
                .serialNo(asset.getSerialNo())
                .status(asset.getStatus() != null ? asset.getStatus().name() : null)
                .condition(asset.getAssetCondition())
                .borrowable(asset.getBorrowable())
                .department(asset.getDepartment() != null ? asset.getDepartment().getName() : null)
                .room(asset.getRoom() != null ? asset.getRoom().getName() : null)
                .qrCodePath(asset.getQrCodePath())
                .qrCodeUrl(qrCodeUrl)
                .qrCodeBase64(asset.getQrCodeBase64())
                .build();

        return ResponseEntity.ok(dto);
    }
}
