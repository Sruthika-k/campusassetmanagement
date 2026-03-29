package com.college.assetmanager.repository;

import com.college.assetmanager.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {

    List<Room> findByDepartmentId(UUID departmentId);

    long countByDepartmentId(UUID departmentId);
}
