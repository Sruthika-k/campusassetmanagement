package com.college.assetmanager.service;

import com.college.assetmanager.dto.AssetRequestDTO;
import com.college.assetmanager.dto.AssetResponseDTO;
import com.college.assetmanager.entity.*;
import com.college.assetmanager.repository.AssetRepository;
import com.college.assetmanager.repository.DepartmentRepository;
import com.college.assetmanager.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final QRCodeService qrCodeService;
    private final EventService eventService;
    private final DepartmentRepository departmentRepository;
    private final RoomRepository roomRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Value("${app.backend.url}")
    private String backendUrl;

    public Asset createAsset(AssetRequestDTO dto) {
        Asset asset = new Asset();
        asset.setName(dto.getName());
        asset.setCategory(dto.getCategory());
        asset.setSerialNo(dto.getSerialNo());
        asset.setStatus(dto.getStatus() != null ? dto.getStatus() : AssetStatus.AVAILABLE);
        asset.setAssetCondition(dto.getCondition());
        asset.setBorrowable(dto.getBorrowable() != null ? dto.getBorrowable() : true);
        asset.setCreatedAt(LocalDateTime.now());

        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getDepartmentId()).orElse(null);
            asset.setDepartment(dept);
        }

        if (dto.getRoomId() != null) {
            Room room = roomRepository.findById(dto.getRoomId()).orElse(null);
            asset.setRoom(room);
        }

        Asset savedAsset = assetRepository.save(asset);

        try {
            encodeAndStoreQr(savedAsset);
            savedAsset = assetRepository.save(savedAsset);
        } catch (Exception ignored) {
            // QR generation is best-effort; asset still created
        }

        try {
            eventService.log(savedAsset.getId(), null, EventType.ASSET_CREATED,
                    "Asset created: " + savedAsset.getName());
        } catch (Exception e) {
            // Log error or handle
        }

        return savedAsset;
    }

    public List<AssetResponseDTO> getAllAssets() {
        return assetRepository.findAllByDeletedAtIsNull().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public Asset getAssetById(UUID id) {
        return assetRepository.findById(id).orElseThrow();
    }

    public Asset getAssetForPublicScan(UUID id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));
        if (asset.getDeletedAt() != null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found");
        }
        return asset;
    }

    public Asset updateAsset(UUID id, AssetRequestDTO dto) {
        Asset asset = assetRepository.findById(id).orElseThrow();

        asset.setName(dto.getName());
        asset.setCategory(dto.getCategory());
        asset.setSerialNo(dto.getSerialNo());
        asset.setStatus(dto.getStatus());
        asset.setAssetCondition(dto.getCondition());
        asset.setBorrowable(dto.getBorrowable());

        if (dto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(dto.getDepartmentId()).orElse(null);
            asset.setDepartment(dept);
        } else {
            asset.setDepartment(null);
        }

        if (dto.getRoomId() != null) {
            Room room = roomRepository.findById(dto.getRoomId()).orElse(null);
            asset.setRoom(room);
        } else {
            asset.setRoom(null);
        }

        return assetRepository.save(asset);
    }

    public String scanUrlForAsset(UUID assetId) {
        return frontendUrl + "/scan/" + assetId;
    }

    /**
     * Build absolute URL for QR image when stored as a file path (legacy); data URIs are returned as-is.
     */
    public String qrImageUrlForAsset(Asset asset) {
        String path = asset.getQrCodePath();
        if (path == null || path.isBlank()) {
            return backendUrl + "/qrcodes/asset_" + asset.getId() + ".png";
        }
        if (path.startsWith("data:")) {
            return path;
        }
        String normalized = path.startsWith("/") ? path : "/" + path;
        return backendUrl + normalized;
    }

    private void encodeAndStoreQr(Asset asset) throws Exception {
        String scanUrl = scanUrlForAsset(asset.getId());
        byte[] qrBytes = qrCodeService.generateQRCodeImage(scanUrl, 300, 300);
        String base64 = Base64.getEncoder().encodeToString(qrBytes);
        asset.setQrCodeBase64(base64);
        asset.setQrCodePath("data:image/png;base64," + base64);
    }

    public Asset regenerateQrCode(UUID id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));
        try {
            encodeAndStoreQr(asset);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate QR");
        }
        return assetRepository.save(asset);
    }

    /**
     * Ensure every non-deleted asset has QR data stored (startup / migration helper).
     */
    public void backfillMissingQrCodes() {
        for (Asset a : assetRepository.findAllByDeletedAtIsNull()) {
            boolean missing = (a.getQrCodeBase64() == null || a.getQrCodeBase64().isBlank())
                    && (a.getQrCodePath() == null || a.getQrCodePath().isBlank()
                    || !a.getQrCodePath().startsWith("data:"));
            if (missing) {
                try {
                    encodeAndStoreQr(a);
                    assetRepository.save(a);
                } catch (Exception ignored) {
                }
            }
        }
    }

    public void deleteAsset(UUID id) {
        Asset asset = assetRepository.findById(id).orElseThrow();
        asset.setDeletedAt(LocalDateTime.now());
        assetRepository.save(asset);

        try {
            eventService.log(asset.getId(), null, EventType.ASSET_DELETED,
                    "Asset soft-deleted: " + asset.getName());
        } catch (Exception e) {
        }
    }

    private AssetResponseDTO mapToResponseDTO(Asset asset) {
        return AssetResponseDTO.builder()
                .id(asset.getId())
                .name(asset.getName())
                .category(asset.getCategory())
                .serialNo(asset.getSerialNo())
                .status(asset.getStatus() != null ? asset.getStatus().name() : null)
                .condition(asset.getAssetCondition())
                .borrowable(asset.getBorrowable())
                .departmentId(asset.getDepartment() != null ? asset.getDepartment().getId() : null)
                .departmentName(asset.getDepartment() != null ? asset.getDepartment().getName() : null)
                .roomId(asset.getRoom() != null ? asset.getRoom().getId() : null)
                .roomName(asset.getRoom() != null ? asset.getRoom().getName() : null)
                .qrCodePath(asset.getQrCodePath())
                .qrCodeBase64(asset.getQrCodeBase64())
                .createdAt(asset.getCreatedAt())
                .build();
    }
}
