package com.college.assetmanager.controller;

import com.college.assetmanager.entity.AssetEvent;
import com.college.assetmanager.repository.AssetEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EventController {

    private final AssetEventRepository eventRepository;

    @GetMapping("/assets/{id}/history")
    public List<AssetEvent> getAssetHistory(@PathVariable UUID id) {
        return eventRepository.findByAssetIdOrderByTimestampDesc(id);
    }

    @GetMapping("/events")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AssetEvent> getAllEvents() {
        return eventRepository.findAll(Sort.by(Sort.Direction.DESC, "timestamp"));
    }
}