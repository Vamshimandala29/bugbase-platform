package com.bugbase.controller;

import com.bugbase.model.Issue;
import com.bugbase.model.IssueStatus;
import com.bugbase.model.User;
import com.bugbase.repository.IssueRepository;
import com.bugbase.repository.ProjectRepository;
import com.bugbase.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("")
@RequiredArgsConstructor
public class IssueController {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @GetMapping("/projects/{projectId}/issues")
    public ResponseEntity<List<Issue>> getIssuesByProject(@PathVariable UUID projectId) {
        if (!projectRepository.existsById(projectId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(issueRepository.findByProjectId(projectId));
    }

    @PostMapping("/projects/{projectId}/issues")
    public ResponseEntity<Issue> createIssue(
            @PathVariable UUID projectId,
            @RequestBody Issue issue,
            @AuthenticationPrincipal User currentUser) {

        return projectRepository.findById(projectId).map(project -> {
            issue.setProject(project);
            issue.setReporter(currentUser);
            if (issue.getStatus() == null) {
                issue.setStatus(IssueStatus.TO_DO);
            }
            return ResponseEntity.ok(issueRepository.save(issue));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/issues/{id}")
    public ResponseEntity<Issue> getIssueById(@PathVariable UUID id) {
        return issueRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/issues/{id}")
    public ResponseEntity<Issue> updateIssue(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> updates) {

        return issueRepository.findById(id).map(issue -> {
            if (updates.containsKey("title")) {
                issue.setTitle((String) updates.get("title"));
            }
            if (updates.containsKey("description")) {
                issue.setDescription((String) updates.get("description"));
            }
            if (updates.containsKey("status")) {
                issue.setStatus(IssueStatus.valueOf((String) updates.get("status")));
            }
            if (updates.containsKey("priority")) {
                issue.setPriority(com.bugbase.model.IssuePriority.valueOf((String) updates.get("priority")));
            }
            if (updates.containsKey("assigneeId")) {
                String assigneeId = (String) updates.get("assigneeId");
                if (assigneeId != null && !assigneeId.isEmpty()) {
                    userRepository.findById(UUID.fromString(assigneeId))
                            .ifPresent(issue::setAssignee);
                } else {
                    issue.setAssignee(null);
                }
            }
            return ResponseEntity.ok(issueRepository.save(issue));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/issues/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable UUID id) {
        if (!issueRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        issueRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Issue deleted successfully"));
    }
}
