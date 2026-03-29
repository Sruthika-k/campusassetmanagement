package com.college.assetmanager.repository;

import com.college.assetmanager.entity.Asset;
import com.college.assetmanager.entity.AssetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AssetRepository extends JpaRepository<Asset, UUID> {

    List<Asset> findAllByDeletedAtIsNull();

    long countByRoomIdAndDeletedAtIsNull(UUID roomId);

    List<Asset> findAllByStatusAndDeletedAtIsNull(AssetStatus status);

    long countByStatusAndDeletedAtIsNull(AssetStatus status);
}