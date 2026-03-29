package com.college.assetmanager.controller;

import com.college.assetmanager.dto.DepartmentResponseDTO;
import com.college.assetmanager.entity.Department;
import com.college.assetmanager.repository.DepartmentRepository;
import com.college.assetmanager.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@Slf4j
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final RoomRepository roomRepository;

    @GetMapping
    public List<DepartmentResponseDTO> getAllDepartments() {
        log.info("Fetching all departments");
        try {
            List<DepartmentResponseDTO> departments = departmentRepository.findAll().stream()
                    .map(d -> DepartmentResponseDTO.builder()
                            .id(d.getId())
                            .name(d.getName())
                            .roomCount(roomRepository.countByDepartmentId(d.getId()))
                            .build())
                    .collect(Collectors.toList());
            log.info("Found {} departments", departments.size());
            return departments;
        } catch (Exception e) {
            log.error("Error fetching departments: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createDepartment(@RequestBody Department department) {
        log.info("Creating department: {}", department);
        
        try {
            // Validate input
            if (department.getName() == null || department.getName().trim().isEmpty()) {
                log.warn("Department name is null or empty");
                return ResponseEntity.badRequest().body("Department name is required");
            }
            
            // Check if department already exists
            if (departmentRepository.existsByName(department.getName())) {
                log.warn("Department with name '{}' already exists", department.getName());
                return ResponseEntity.badRequest().body("Department with this name already exists");
            }
            
            Department saved = departmentRepository.save(department);
            log.info("Department created successfully: {}", saved);
            return ResponseEntity.ok(saved);
            
        } catch (Exception e) {
            log.error("Error creating department: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to create department: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDepartment(@PathVariable UUID id) {
        log.info("Deleting department with id: {}", id);
        
        try {
            if (roomRepository.countByDepartmentId(id) > 0) {
                log.warn("Cannot delete department {} - has associated rooms", id);
                return ResponseEntity.badRequest().body("Remove all rooms first");
            }
            
            departmentRepository.deleteById(id);
            log.info("Department deleted successfully: {}", id);
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Error deleting department {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to delete department: " + e.getMessage());
        }
    }
}
