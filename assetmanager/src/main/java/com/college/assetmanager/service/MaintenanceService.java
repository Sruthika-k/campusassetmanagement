package com.college.assetmanager.service;

import com.college.assetmanager.dto.IssueRequest;
import com.college.assetmanager.dto.MaintenanceResponseDTO;
import com.college.assetmanager.entity.*;
import com.college.assetmanager.repository.AssetRepository;
import com.college.assetmanager.repository.MaintenanceRepository;
import com.college.assetmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final AssetRepository       assetRepository;
    private final UserRepository        userRepository;
    private final EventService          eventService;

    // ── GET all ─────────────────────────────────────────────────────────────
    public List<MaintenanceResponseDTO> getAllIssues() {
        return maintenanceRepository.findAll().stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    // ── GET by reporter ──────────────────────────────────────────────────────
    public List<MaintenanceResponseDTO> getReportedBy(UUID userId) {
        return maintenanceRepository.findByReportedBy(userId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    // ── GET technician's assigned issues ─────────────────────────────────────
    public List<MaintenanceResponseDTO> getMyIssues(UUID technicianId) {
        return maintenanceRepository.findByTechnicianId(technicianId).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    // ── REPORT ISSUE ─────────────────────────────────────────────────────────
    @Transactional
    public MaintenanceResponseDTO reportIssue(IssueRequest request, UUID reportedById) {

        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));

        String priority = (request.getPriority() != null && !request.getPriority().isBlank())
                ? request.getPriority().toUpperCase()
                : "MEDIUM";

        MaintenanceIssue issue = MaintenanceIssue.builder()
                .assetId(request.getAssetId())
                .reportedBy(reportedById)
                .description(request.getDescription())
                .priority(priority)
                .status(MaintenanceStatus.OPEN)
                .createdAt(LocalDateTime.now())
                .build();

        MaintenanceIssue saved = maintenanceRepository.save(issue);

        asset.setStatus(AssetStatus.UNDER_MAINTENANCE);
        assetRepository.save(asset);

        eventService.log(request.getAssetId(), reportedById, EventType.ISSUE_REPORTED,
                "Issue reported: " + request.getDescription());

        return toDTO(saved);
    }

    // ── ASSIGN TECHNICIAN ────────────────────────────────────────────────────
    @Transactional
    public MaintenanceResponseDTO assignTechnician(UUID issueId, UUID technicianId, UUID assignedById) {

        MaintenanceIssue issue = maintenanceRepository.findById(issueId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));

        if (issue.getStatus() != MaintenanceStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only OPEN issues can be assigned");
        }

        issue.setTechnicianId(technicianId);
        issue.setAssignedById(assignedById);
        issue.setStatus(MaintenanceStatus.ASSIGNED);

        MaintenanceIssue saved = maintenanceRepository.save(issue);

        eventService.log(issue.getAssetId(), assignedById, EventType.ISSUE_ASSIGNED,
                "Technician " + technicianId + " assigned");

        return toDTO(saved);
    }

    // ── RESOLVE ISSUE ────────────────────────────────────────────────────────
    @Transactional
    public MaintenanceResponseDTO resolveIssue(UUID issueId, UUID resolvedById, String notes) {

        MaintenanceIssue issue = maintenanceRepository.findById(issueId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));

        if (issue.getStatus() == MaintenanceStatus.RESOLVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Issue is already resolved");
        }

        issue.setStatus(MaintenanceStatus.RESOLVED);
        issue.setResolvedAt(LocalDateTime.now());
        issue.setResolvedNotes(notes);

        MaintenanceIssue saved = maintenanceRepository.save(issue);

        Asset asset = assetRepository.findById(issue.getAssetId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asset not found"));
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepository.save(asset);

        eventService.log(issue.getAssetId(), resolvedById, EventType.ISSUE_RESOLVED,
                "Issue resolved. Notes: " + (notes != null ? notes : ""));

        return toDTO(saved);
    }

    // ── MAPPING ──────────────────────────────────────────────────────────────
    private MaintenanceResponseDTO toDTO(MaintenanceIssue issue) {
        String assetName = null;
        try {
            assetName = assetRepository.findById(issue.getAssetId())
                    .map(Asset::getName).orElse("Unknown Asset");
        } catch (Exception ignored) {}

        String reporterName = null;
        try {
            if (issue.getReportedBy() != null) {
                reporterName = userRepository.findById(issue.getReportedBy())
                        .map(User::getName).orElse(null);
            }
        } catch (Exception ignored) {}

        String techName = null;
        try {
            if (issue.getTechnicianId() != null) {
                techName = userRepository.findById(issue.getTechnicianId())
                        .map(User::getName).orElse(null);
            }
        } catch (Exception ignored) {}

        return MaintenanceResponseDTO.builder()
                .id(issue.getId())
                .assetId(issue.getAssetId())
                .assetName(assetName)
                .description(issue.getDescription())
                .priority(issue.getPriority())
                .status(issue.getStatus() != null ? issue.getStatus().name() : null)
                .reportedById(issue.getReportedBy())
                .reportedByName(reporterName)
                .technicianId(issue.getTechnicianId())
                .technicianName(techName)
                .createdAt(issue.getCreatedAt())
                .resolvedAt(issue.getResolvedAt())
                .resolvedNotes(issue.getResolvedNotes())
                .build();
    }
}