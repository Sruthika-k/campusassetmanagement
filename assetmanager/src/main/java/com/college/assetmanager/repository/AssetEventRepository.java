package com.college.assetmanager.repository;

import com.college.assetmanager.entity.AssetEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssetEventRepository extends JpaRepository<AssetEvent, UUID> {
    List<AssetEvent> findByAssetIdOrderByTimestampDesc(UUID assetId);
}