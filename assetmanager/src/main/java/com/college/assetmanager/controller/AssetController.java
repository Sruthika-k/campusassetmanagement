package com.college.assetmanager.controller;

import com.college.assetmanager.dto.AssetRequestDTO;
import com.college.assetmanager.dto.AssetResponseDTO;
import com.college.assetmanager.entity.Asset;
import com.college.assetmanager.entity.AssetStatus;
import com.college.assetmanager.repository.AssetRepository;
import com.college.assetmanager.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;
    private final AssetRepository assetRepository;
    private final com.college.assetmanager.service.QRCodeService qrCodeService;

    @PostMapping
    public ResponseEntity<Asset> createAsset(@RequestBody AssetRequestDTO dto) {
        return ResponseEntity.ok(assetService.createAsset(dto));
    }

    @GetMapping
    public List<AssetResponseDTO> getAssets() {
        return assetService.getAllAssets();
    }

    @GetMapping("/{id}")
    public Asset getAssetById(@PathVariable UUID id) {
        return assetService.getAssetById(id);
    }

    @GetMapping("/{id}/qr-label")
    public ResponseEntity<byte[]> getQRLabel(@PathVariable UUID id) {
        Asset asset = assetRepository.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "Asset not found"));

        String scanUrl = assetService.scanUrlForAsset(asset.getId());
        String deptName = asset.getDepartment() != null 
            ? asset.getDepartment().getName() : "—";
        String roomName = asset.getRoom() != null 
            ? asset.getRoom().getName() : "—";

        byte[] labelBytes = qrCodeService.generateAssetLabel(
            asset.getId().toString(),
            asset.getName(),
            asset.getCategory(),
            asset.getSerialNo(),
            deptName,
            roomName,
            scanUrl
        );

        return ResponseEntity.ok()
            .contentType(org.springframework.http.MediaType.IMAGE_PNG)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "inline; filename=asset-" + asset.getId() + "-label.png")
            .body(labelBytes);
    }

    @PostMapping("/{id}/regenerate-qr")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> regenerateQR(@PathVariable UUID id) {
        Asset asset = assetService.regenerateQrCode(id);
        return ResponseEntity.ok(Map.of(
                "message", "QR code regenerated successfully",
                "qrCodePath", asset.getQrCodePath() != null ? asset.getQrCodePath() : ""
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable UUID id, @RequestBody AssetRequestDTO dto) {
        return ResponseEntity.ok(assetService.updateAsset(id, dto));
    }

    @DeleteMapping("/{id}")
    public void deleteAsset(@PathVariable UUID id) {
        assetService.deleteAsset(id);
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportAssets() {
        List<AssetResponseDTO> assets = assetService.getAllAssets();
        StringBuilder csv = new StringBuilder();
        csv.append("id,name,category,serialNo,status,condition,department,room,createdAt\n");
        for (AssetResponseDTO a : assets) {
            csv.append(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                a.getId(),
                a.getName(),
                a.getCategory(),
                a.getSerialNo() != null ? a.getSerialNo() : "",
                a.getStatus(),
                a.getCondition() != null ? a.getCondition() : "",
                a.getDepartmentName() != null ? a.getDepartmentName() : "",
                a.getRoomName() != null ? a.getRoomName() : "",
                a.getCreatedAt() != null ? a.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : ""));
        }

        String filename = "assets-export-" + java.time.LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                .body(csv.toString().getBytes());
    }

    @DeleteMapping("/retired")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> clearRetiredAssets() {
        List<Asset> retired = assetRepository.findAllByStatusAndDeletedAtIsNull(AssetStatus.RETIRED);
        long count = retired.size();
        assetRepository.deleteAll(retired);
        return ResponseEntity.ok(count);
    }
}