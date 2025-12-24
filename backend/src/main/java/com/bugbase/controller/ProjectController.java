package com.bugbase.controller;

import com.bugbase.model.Project;
import com.bugbase.repository.ProjectRepository;
import com.bugbase.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Projects", description = "Management of bug tracking projects")
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Operation(summary = "Get all projects")
    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Operation(summary = "Get project by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable UUID id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Create a new project")
    @PostMapping
    public Project createProject(@RequestBody Project project) {
        // In real app, get 'owner' from SecurityContext
        return projectRepository.save(project);
    }
}
