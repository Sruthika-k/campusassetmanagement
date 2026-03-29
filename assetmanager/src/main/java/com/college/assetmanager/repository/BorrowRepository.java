package com.college.assetmanager.repository;

import com.college.assetmanager.entity.BorrowRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BorrowRepository extends JpaRepository<BorrowRequest, UUID> {
    List<BorrowRequest> findByUserId(UUID userId);
}