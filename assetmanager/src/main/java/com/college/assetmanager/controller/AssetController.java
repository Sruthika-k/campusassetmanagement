package com.college.assetmanager.controller;

import com.college.assetmanager.entity.Asset;
import com.college.assetmanager.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @PostMapping
    public Asset createAsset(@RequestBody Asset asset) {
        return assetService.createAsset(asset);
    }

    @GetMapping
    public List<Asset> getAssets() {
        return assetService.getAllAssets();
    }

    @GetMapping("/{id}")
public Asset getAssetById(@PathVariable UUID id) {
    return assetService.getAssetById(id);
}
    @PutMapping("/{id}")
public Asset updateAsset(@PathVariable UUID id, @RequestBody Asset asset) {
    return assetService.updateAsset(id, asset);
}

@DeleteMapping("/{id}")
public void deleteAsset(@PathVariable UUID id) {
    assetService.deleteAsset(id);
}
}