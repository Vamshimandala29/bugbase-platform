import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';

interface Issue {
  id: string;
  title: string;
  description?: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee?: { id: string; fullName: string; email: string };
  reporter?: { id: string; fullName: string };
  project?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: { id: string; fullName: string };
  createdAt: string;
}

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="detail-container">
      <!-- Header -->
      <header class="detail-header">
        <a [routerLink]="(issue && issue.project) ? ['/projects', issue.project.id, 'board'] : ['/dashboard']" class="back-btn">
          ← Back to Board
        </a>
        <div class="header-actions">
          <button class="btn-danger" (click)="deleteIssue()">Delete</button>
        </div>
      </header>

      <div class="detail-content" *ngIf="issue">
        <!-- Main Content -->
        <div class="main-section">
          <!-- Title -->
          <div class="title-section">
            <input *ngIf="editing" [(ngModel)]="issue.title" class="title-input" (blur)="saveChanges()">
            <h1 *ngIf="!editing" (click)="editing = true">{{ issue.title }}</h1>
            <span class="priority-badge" *ngIf="issue.priority" [class]="issue.priority.toLowerCase()">{{ issue.priority }}</span>
          </div>

          <!-- Description -->
          <div class="description-section">
            <h3>Description</h3>
            <textarea *ngIf="editing" [(ngModel)]="issue.description" (blur)="saveChanges()"></textarea>
            <p *ngIf="!editing" (click)="editing = true">{{ issue.description || 'Click to add description...' }}</p>
          </div>

          <!-- Comments -->
          <div class="comments-section">
            <h3>Comments ({{ comments.length }})</h3>
            
            <div class="add-comment">
              <textarea [(ngModel)]="newComment" placeholder="Add a comment..."></textarea>
              <button class="btn-primary" (click)="addComment()" [disabled]="!newComment.trim()">
                Post Comment
              </button>
            </div>

            <div class="comments-list">
              <div class="comment" *ngFor="let comment of comments">
                <div class="comment-header">
                  <div class="comment-avatar">{{ (comment?.author?.fullName || 'U').charAt(0) }}</div>
                  <div class="comment-meta">
                    <span class="comment-author">{{ comment?.author?.fullName }}</span>
                    <span class="comment-date">{{ comment.createdAt | date:'short' }}</span>
                  </div>
                  <button class="delete-comment" *ngIf="comment?.author?.id === currentUserId" 
                          (click)="deleteComment(comment.id)">×</button>
                </div>
                <div class="comment-body">{{ comment.content }}</div>
              </div>

              <div class="no-comments" *ngIf="comments.length === 0">
                No comments yet. Be the first to comment!
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="sidebar-section">
          <div class="sidebar-card">
            <h4>Status</h4>
            <select [(ngModel)]="issue.status" (change)="saveChanges()">
              <option value="TO_DO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div class="sidebar-card">
            <h4>Priority</h4>
            <select [(ngModel)]="issue.priority" (change)="saveChanges()">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div class="sidebar-card">
            <h4>Assignee</h4>
            <div class="assignee-info" *ngIf="issue.assignee">
              <div class="assignee-avatar">{{ (issue?.assignee?.fullName || 'U').charAt(0) }}</div>
              <span>{{ issue?.assignee?.fullName }}</span>
            </div>
            <span class="unassigned" *ngIf="!issue.assignee">Unassigned</span>
          </div>

          <div class="sidebar-card">
            <h4>Reporter</h4>
            <div class="assignee-info" *ngIf="issue.reporter">
              <div class="assignee-avatar">{{ (issue?.reporter?.fullName || 'U').charAt(0) }}</div>
              <span>{{ issue?.reporter?.fullName }}</span>
            </div>
          </div>

          <div class="sidebar-card">
            <h4>Created</h4>
            <span class="date-text">{{ issue.createdAt | date:'medium' }}</span>
          </div>

          <div class="sidebar-card">
            <h4>Updated</h4>
            <span class="date-text">{{ issue.updatedAt | date:'medium' }}</span>
          </div>
        </aside>
      </div>

      <div class="loading" *ngIf="!issue">Loading issue...</div>
    </div>
  `,
  styles: [`
    .detail-container {
      min-height: 100vh;
      background: #0f0f17;
      padding: 24px;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .back-btn {
      color: rgba(255,255,255,0.6);
      text-decoration: none;
      font-size: 14px;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .back-btn:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }

    .btn-danger {
      padding: 10px 20px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #ef4444;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.2);
    }

    .detail-content {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 32px;
    }

    .main-section {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 32px;
    }

    .title-section {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 32px;
    }

    .title-section h1 {
      color: #fff;
      font-size: 28px;
      margin: 0;
      flex: 1;
      cursor: pointer;
    }

    .title-input {
      flex: 1;
      font-size: 28px;
      font-weight: 700;
      background: transparent;
      border: 1px solid rgba(99, 102, 241, 0.5);
      border-radius: 8px;
      color: #fff;
      padding: 8px 12px;
    }

    .priority-badge {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .priority-badge.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .priority-badge.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .priority-badge.low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }

    .description-section {
      margin-bottom: 40px;
    }

    .description-section h3, .comments-section h3 {
      color: rgba(255,255,255,0.6);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }

    .description-section p {
      color: rgba(255,255,255,0.8);
      line-height: 1.7;
      cursor: pointer;
      padding: 12px;
      border-radius: 8px;
      transition: background 0.2s;
    }

    .description-section p:hover {
      background: rgba(255,255,255,0.05);
    }

    .description-section textarea {
      width: 100%;
      min-height: 120px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(99, 102, 241, 0.5);
      border-radius: 8px;
      color: #fff;
      padding: 12px;
      font-size: 14px;
      resize: vertical;
    }

    .add-comment {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .add-comment textarea {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #fff;
      padding: 12px;
      font-size: 14px;
      resize: none;
      min-height: 60px;
    }

    .add-comment textarea:focus {
      outline: none;
      border-color: #6366f1;
    }

    .btn-primary {
      padding: 12px 20px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      align-self: flex-end;
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .comments-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .comment {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 10px;
      padding: 16px;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .comment-avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
    }

    .comment-meta {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .comment-author {
      color: #fff;
      font-weight: 500;
      font-size: 14px;
    }

    .comment-date {
      color: rgba(255,255,255,0.4);
      font-size: 12px;
    }

    .delete-comment {
      background: none;
      border: none;
      color: rgba(255,255,255,0.3);
      font-size: 20px;
      cursor: pointer;
      padding: 4px 8px;
    }

    .delete-comment:hover {
      color: #ef4444;
    }

    .comment-body {
      color: rgba(255,255,255,0.8);
      font-size: 14px;
      line-height: 1.6;
    }

    .no-comments {
      text-align: center;
      color: rgba(255,255,255,0.4);
      padding: 40px;
    }

    /* Sidebar */
    .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sidebar-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 10px;
      padding: 16px;
    }

    .sidebar-card h4 {
      color: rgba(255,255,255,0.5);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 8px 0;
    }

    .sidebar-card select {
      width: 100%;
      padding: 10px 12px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      color: #fff;
      cursor: pointer;
    }

    .sidebar-card select:focus {
      outline: none;
      border-color: #6366f1;
    }

    .assignee-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .assignee-avatar {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
    }

    .assignee-info span, .unassigned, .date-text {
      color: rgba(255,255,255,0.8);
      font-size: 14px;
    }

    .unassigned {
      font-style: italic;
      color: rgba(255,255,255,0.4);
    }

    .loading {
      text-align: center;
      color: rgba(255,255,255,0.5);
      padding: 60px;
    }
  `]
})
export class IssueDetailComponent implements OnInit {
  issue: Issue | null = null;
  comments: Comment[] = [];
  newComment = '';
  editing = false;
  currentUserId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const issueId = this.route.snapshot.paramMap.get('issueId');
    this.currentUserId = this.authService.getCurrentUser()?.id || '';
    this.loadIssue(issueId!);
    this.loadComments(issueId!);
  }

  loadIssue(id: string) {
    this.http.get<Issue>(`${environment.apiUrl}/issues/${id}`).subscribe({
      next: (issue) => this.issue = issue,
      error: () => this.router.navigate(['/dashboard'])
    });
  }

  loadComments(issueId: string) {
    this.http.get<Comment[]>(`${environment.apiUrl}/issues/${issueId}/comments`).subscribe({
      next: (comments) => this.comments = comments
    });
  }

  saveChanges() {
    if (!this.issue) return;
    this.http.patch<Issue>(`${environment.apiUrl}/issues/${this.issue.id}`, {
      title: this.issue.title,
      description: this.issue.description,
      status: this.issue.status,
      priority: this.issue.priority
    }).subscribe({
      next: (updated) => {
        this.issue = updated;
        this.editing = false;
      }
    });
  }

  addComment() {
    if (!this.issue || !this.newComment.trim()) return;
    this.http.post<Comment>(`${environment.apiUrl}/issues/${this.issue.id}/comments`, {
      content: this.newComment
    }).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newComment = '';
      }
    });
  }

  deleteComment(commentId: string) {
    if (!this.issue) return;
    this.http.delete(`${environment.apiUrl}/issues/${this.issue.id}/comments/${commentId}`).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
      }
    });
  }

  deleteIssue() {
    if (!this.issue || !confirm('Are you sure you want to delete this issue?')) return;
    this.http.delete(`${environment.apiUrl}/issues/${this.issue.id}`).subscribe({
      next: () => this.router.navigate(['/dashboard'])
    });
  }
}
