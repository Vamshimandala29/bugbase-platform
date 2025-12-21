package com.bugbase.controller;

import com.bugbase.model.Issue;
import com.bugbase.repository.IssueRepository;
import com.bugbase.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class IssueController {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;

    @GetMapping("/projects/{projectId}/issues")
    public ResponseEntity<List<Issue>> getIssuesByProject(@PathVariable UUID projectId) {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(issueRepository.findByProjectId(projectId));
    }

    @PostMapping("/projects/{projectId}/issues")
    public ResponseEntity<Issue> createIssue(@PathVariable UUID projectId, @RequestBody Issue issue) {
        return projectRepository.findById(projectId).map(project -> {
            issue.setProject(project);
            return ResponseEntity.ok(issueRepository.save(issue));
        }).orElse(ResponseEntity.notFound().build());
    }
}
