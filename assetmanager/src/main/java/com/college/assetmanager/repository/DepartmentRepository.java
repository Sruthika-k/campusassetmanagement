package com.college.assetmanager.repository;

import com.college.assetmanager.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    boolean existsByName(String name);
}
