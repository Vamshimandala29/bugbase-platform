package com.bugbase.controller;

import com.bugbase.model.Comment;
import com.bugbase.model.User;
import com.bugbase.repository.CommentRepository;
import com.bugbase.repository.IssueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/issues/{issueId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentRepository commentRepository;
    private final IssueRepository issueRepository;

    @GetMapping
    public ResponseEntity<List<Comment>> getCommentsByIssue(@PathVariable UUID issueId) {
        if (!issueRepository.existsById(issueId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(commentRepository.findByIssueId(issueId));
    }

    @PostMapping
    public ResponseEntity<Comment> addComment(
            @PathVariable UUID issueId,
            @RequestBody Comment comment,
            @AuthenticationPrincipal User currentUser) {

        return issueRepository.findById(issueId).map(issue -> {
            comment.setIssue(issue);
            comment.setAuthor(currentUser);
            return ResponseEntity.ok(commentRepository.save(comment));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable UUID issueId,
            @PathVariable UUID commentId,
            @AuthenticationPrincipal User currentUser) {

        return commentRepository.findById(commentId)
                .filter(comment -> comment.getAuthor().getId().equals(currentUser.getId()))
                .map(comment -> {
                    commentRepository.delete(comment);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
