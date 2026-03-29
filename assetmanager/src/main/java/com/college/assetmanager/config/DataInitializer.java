package com.college.assetmanager.config;

import com.college.assetmanager.entity.Department;
import com.college.assetmanager.entity.Role;
import com.college.assetmanager.entity.Room;
import com.college.assetmanager.entity.User;
import com.college.assetmanager.repository.DepartmentRepository;
import com.college.assetmanager.repository.RoomRepository;
import com.college.assetmanager.repository.UserRepository;
import com.college.assetmanager.service.AssetService;
import com.college.assetmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final DepartmentRepository departmentRepository;
    private final RoomRepository roomRepository;
    private final AssetService assetService;

    @Override
    public void run(ApplicationArguments args) {
        // --- Seed admin user ---
        String adminEmail = "admin@college.com";
        Optional<User> existingUser = userRepository.findByEmail(adminEmail);

        if (existingUser.isEmpty()) {
            User admin = User.builder()
                    .name("Admin")
                    .email(adminEmail)
                    .password("admin123")
                    .role(Role.ADMIN)
                    .build();

            userService.createUser(admin);
            System.out.println("Admin user ready: admin@college.com / admin123");
        } else {
            // Ensure admin password is also encoded correctly if updated
            existingUser.get().setPassword(passwordEncoder.encode("admin123"));
            userService.saveUser(existingUser.get());
            System.out.println("Admin user updated and ready: admin@college.com / admin123");
        }

        // --- Seed departments ---
        Department csDept;
        Department eceDept;
        Department mechDept;

        if (!departmentRepository.existsByName("Computer Science")) {
            csDept = departmentRepository.save(
                    Department.builder().name("Computer Science").build());
        } else {
            csDept = departmentRepository.findAll().stream()
                    .filter(d -> "Computer Science".equals(d.getName()))
                    .findFirst().orElseThrow();
        }

        if (!departmentRepository.existsByName("Electronics")) {
            eceDept = departmentRepository.save(
                    Department.builder().name("Electronics").build());
        } else {
            eceDept = departmentRepository.findAll().stream()
                    .filter(d -> "Electronics".equals(d.getName()))
                    .findFirst().orElseThrow();
        }

        if (!departmentRepository.existsByName("Mechanical")) {
            mechDept = departmentRepository.save(
                    Department.builder().name("Mechanical").build());
        } else {
            mechDept = departmentRepository.findAll().stream()
                    .filter(d -> "Mechanical".equals(d.getName()))
                    .findFirst().orElseThrow();
        }

        // --- Seed rooms ---
        if (roomRepository.findByDepartmentId(csDept.getId()).isEmpty()) {
            roomRepository.save(Room.builder().name("CS Lab 1").department(csDept).build());
            roomRepository.save(Room.builder().name("CS Lab 2").department(csDept).build());
        }

        if (roomRepository.findByDepartmentId(eceDept.getId()).isEmpty()) {
            roomRepository.save(Room.builder().name("ECE Lab 1").department(eceDept).build());
        }

        if (roomRepository.findByDepartmentId(mechDept.getId()).isEmpty()) {
            roomRepository.save(Room.builder().name("Mech Lab 1").department(mechDept).build());
        }

        assetService.backfillMissingQrCodes();
    }
}
