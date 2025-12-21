package com.bugbase.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    private String refreshToken;
    private UUID id;
    private String email;
    private String fullName; // "username" in frontend convention usually
    private List<String> roles;
    private String type = "Bearer";

    public JwtResponse(String accessToken, String refreshToken, UUID id, String email, String fullName,
            List<String> roles) {
        this.token = accessToken;
        this.refreshToken = refreshToken;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.roles = roles;
    }
}
