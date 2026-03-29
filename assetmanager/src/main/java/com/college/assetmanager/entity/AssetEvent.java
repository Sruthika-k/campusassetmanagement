package com.college.assetmanager.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetEvent {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID assetId;

    private UUID actorId;

    @Enumerated(EnumType.STRING)
    private EventType eventType;

    private String description;

    private LocalDateTime timestamp;
}