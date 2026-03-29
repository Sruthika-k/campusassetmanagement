package com.college.assetmanager.controller;

import com.college.assetmanager.dto.RoomResponseDTO;
import com.college.assetmanager.entity.Room;
import com.college.assetmanager.repository.AssetRepository;
import com.college.assetmanager.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomRepository roomRepository;
    private final AssetRepository assetRepository;

    @GetMapping
    public List<RoomResponseDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(r -> RoomResponseDTO.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .departmentId(r.getDepartment().getId())
                        .departmentName(r.getDepartment().getName())
                        .assetCount(assetRepository.countByRoomIdAndDeletedAtIsNull(r.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    @GetMapping("/department/{departmentId}")
    public List<RoomResponseDTO> getRoomsByDepartment(@PathVariable UUID departmentId) {
        return roomRepository.findByDepartmentId(departmentId).stream()
                .map(r -> RoomResponseDTO.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .departmentId(r.getDepartment().getId())
                        .departmentName(r.getDepartment().getName())
                        .assetCount(assetRepository.countByRoomIdAndDeletedAtIsNull(r.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        Room saved = roomRepository.save(room);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteRoom(@PathVariable UUID id) {
        if (assetRepository.countByRoomIdAndDeletedAtIsNull(id) > 0) {
            return ResponseEntity.badRequest().body("Reassign assets before deleting room");
        }
        roomRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
