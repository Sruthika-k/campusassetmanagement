package com.college.assetmanager.controller;

import com.college.assetmanager.dto.DepartmentResponseDTO;
import com.college.assetmanager.entity.Department;
import com.college.assetmanager.repository.DepartmentRepository;
import com.college.assetmanager.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final RoomRepository roomRepository;

    @GetMapping
    public List<DepartmentResponseDTO> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(d -> DepartmentResponseDTO.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .roomCount(roomRepository.countByDepartmentId(d.getId()))
                        .build())
                .collect(Collectors.toList());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        Department saved = departmentRepository.save(department);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDepartment(@PathVariable UUID id) {
        if (roomRepository.countByDepartmentId(id) > 0) {
            return ResponseEntity.badRequest().body("Remove all rooms first");
        }
        departmentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
