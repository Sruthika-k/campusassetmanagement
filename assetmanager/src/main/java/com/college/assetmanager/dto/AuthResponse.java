package com.college.assetmanager.dto;

import com.college.assetmanager.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;
    private String name;
    private String email;
    private String role;

    public AuthResponse(String token, User user) {
        this.token = token;
        this.userId = user.getId().toString();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole().name();
    }
}
