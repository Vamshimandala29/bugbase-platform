package com.bugbase.controller;

import com.bugbase.model.Role;
import com.bugbase.model.User;
import com.bugbase.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Users", description = "User management and role assignment")
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @Operation(summary = "Get all users (Admin only)")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Update user role (Admin only)")
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {

        String roleName = body.get("role");
        Role newRole;
        try {
            newRole = Role.valueOf(roleName.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role: " + roleName));
        }

        return userRepository.findById(id)
                .map(user -> {
                    user.setRole(newRole);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete a user (Admin only)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
