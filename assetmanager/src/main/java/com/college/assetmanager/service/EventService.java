package com.college.assetmanager.service;

import com.college.assetmanager.entity.AssetEvent;
import com.college.assetmanager.repository.AssetEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

import com.college.assetmanager.entity.EventType;

@Service
@RequiredArgsConstructor
public class EventService {

    private final AssetEventRepository eventRepository;

    public void log(UUID assetId, UUID actorId, EventType eventType, String description) {

        AssetEvent event = AssetEvent.builder()
                .assetId(assetId)
                .actorId(actorId)
                .eventType(eventType)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();

        eventRepository.save(event);
    }
}
