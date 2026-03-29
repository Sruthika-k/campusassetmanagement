package com.college.assetmanager.repository;

import com.college.assetmanager.entity.MaintenanceIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MaintenanceRepository extends JpaRepository<MaintenanceIssue, UUID> {
    List<MaintenanceIssue> findByTechnicianId(UUID technicianId);
    List<MaintenanceIssue> findByReportedBy(UUID reportedBy);
}