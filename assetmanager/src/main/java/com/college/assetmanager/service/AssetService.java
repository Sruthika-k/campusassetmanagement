package com.college.assetmanager.service;
//package com.college.assetmanager.repository;
import com.college.assetmanager.entity.Asset;
import com.college.assetmanager.repository.AssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;

    @Autowired
private QRCodeService qrCodeService;

public Asset createAsset(Asset asset) {

    asset.setCreatedAt(LocalDateTime.now());

    Asset savedAsset = assetRepository.save(asset);

    try {
        String qrPath = qrCodeService.generateQRCode(savedAsset.getId());
        savedAsset.setQrCodePath(qrPath);
        assetRepository.save(savedAsset);
    } catch (Exception e) {
        e.printStackTrace();
    }

    return savedAsset;
}

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }

    public Asset getAsset(UUID id) {
        return assetRepository.findById(id).orElseThrow();
    }

    public Asset getAssetById(UUID id) {
    return assetRepository.findById(id).orElseThrow();
}
public Asset updateAsset(UUID id, Asset updatedAsset) {

    Asset asset = assetRepository.findById(id).orElseThrow();

    asset.setName(updatedAsset.getName());
    asset.setCategory(updatedAsset.getCategory());
    asset.setSerialNo(updatedAsset.getSerialNo());
    asset.setStatus(updatedAsset.getStatus());
    asset.setAssetCondition(updatedAsset.getAssetCondition());

    return assetRepository.save(asset);
}
public void deleteAsset(UUID id) {
    assetRepository.deleteById(id);
}
}