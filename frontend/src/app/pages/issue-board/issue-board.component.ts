import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  assignee?: { id: string; fullName: string };
  reporter?: { id: string; fullName: string };
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-issue-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="board-container">
      <!-- Header -->
      <header class="board-header">
        <div class="header-left">
          <a routerLink="/dashboard" class="back-btn">← Back</a>
          <h1>{{ project?.name || 'Loading...' }}</h1>
        </div>
        <button class="btn-primary" (click)="showCreateModal = true">+ New Issue</button>
      </header>

      <!-- Kanban Board -->
      <div class="kanban-board">
        <!-- TO DO Column -->
        <div class="kanban-column">
          <div class="column-header todo">
            <span class="column-dot"></span>
            <h3>To Do</h3>
            <span class="count">{{ getIssuesByStatus('TO_DO').length }}</span>
          </div>
          <div class="column-cards">
            <div class="issue-card" *ngFor="let issue of getIssuesByStatus('TO_DO')"
                 [routerLink]="['/issues', issue.id]">
              <span class="priority-badge" *ngIf="issue.priority" [class]="issue.priority.toLowerCase()">{{ issue.priority }}</span>
              <h4>{{ issue.title }}</h4>
              <p>{{ (issue.description || '') | slice:0:80 }}{{ (issue.description?.length || 0) > 80 ? '...' : '' }}</p>
              <div class="card-footer">
                <span class="assignee" *ngIf="issue.assignee">{{ issue.assignee.fullName }}</span>
                <span class="assignee unassigned" *ngIf="!issue.assignee">Unassigned</span>
              </div>
            </div>
          </div>
        </div>

        <!-- IN PROGRESS Column -->
        <div class="kanban-column">
          <div class="column-header in-progress">
            <span class="column-dot"></span>
            <h3>In Progress</h3>
            <span class="count">{{ getIssuesByStatus('IN_PROGRESS').length }}</span>
          </div>
          <div class="column-cards">
            <div class="issue-card" *ngFor="let issue of getIssuesByStatus('IN_PROGRESS')"
                 [routerLink]="['/issues', issue.id]">
              <span class="priority-badge" *ngIf="issue.priority" [class]="issue.priority.toLowerCase()">{{ issue.priority }}</span>
              <h4>{{ issue.title }}</h4>
              <p>{{ (issue.description || '') | slice:0:80 }}{{ (issue.description?.length || 0) > 80 ? '...' : '' }}</p>
              <div class="card-footer">
                <span class="assignee" *ngIf="issue.assignee">{{ issue.assignee.fullName }}</span>
                <span class="assignee unassigned" *ngIf="!issue.assignee">Unassigned</span>
              </div>
            </div>
          </div>
        </div>

        <!-- DONE Column -->
        <div class="kanban-column">
          <div class="column-header done">
            <span class="column-dot"></span>
            <h3>Done</h3>
            <span class="count">{{ getIssuesByStatus('DONE').length }}</span>
          </div>
          <div class="column-cards">
            <div class="issue-card" *ngFor="let issue of getIssuesByStatus('DONE')"
                 [routerLink]="['/issues', issue.id]">
              <span class="priority-badge" *ngIf="issue.priority" [class]="issue.priority.toLowerCase()">{{ issue.priority }}</span>
              <h4>{{ issue.title }}</h4>
              <p>{{ (issue.description || '') | slice:0:80 }}{{ (issue.description?.length || 0) > 80 ? '...' : '' }}</p>
              <div class="card-footer">
                <span class="assignee" *ngIf="issue.assignee">{{ issue.assignee.fullName }}</span>
                <span class="assignee unassigned" *ngIf="!issue.assignee">Unassigned</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Issue Modal -->
      <div class="modal-overlay" *ngIf="showCreateModal" (click)="showCreateModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Create New Issue</h2>
          <form (ngSubmit)="createIssue()">
            <div class="form-group">
              <label>Title</label>
              <input type="text" [(ngModel)]="newIssue.title" name="title" placeholder="Bug title" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="newIssue.description" name="description" placeholder="Describe the issue..."></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Priority</label>
                <select [(ngModel)]="newIssue.priority" name="priority">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select [(ngModel)]="newIssue.status" name="status">
                  <option value="TO_DO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showCreateModal = false">Cancel</button>
              <button type="submit" class="btn-primary">Create Issue</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .board-container {
      min-height: 100vh;
      background: #0f0f17;
      padding: 24px;
    }

    .board-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
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

    .board-header h1 {
      color: #fff;
      font-size: 24px;
      margin: 0;
    }

    .btn-primary {
      padding: 12px 24px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
      border-radius: 10px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
    }

    .kanban-board {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      height: calc(100vh - 140px);
    }

    .kanban-column {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      display: flex;
      flex-direction: column;
    }

    .column-header {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .column-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .todo .column-dot { background: #f59e0b; }
    .in-progress .column-dot { background: #3b82f6; }
    .done .column-dot { background: #22c55e; }

    .column-header h3 {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      margin: 0;
      flex: 1;
    }

    .count {
      background: rgba(255,255,255,0.1);
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      color: rgba(255,255,255,0.6);
    }

    .column-cards {
      padding: 16px;
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .issue-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .issue-card:hover {
      border-color: rgba(99, 102, 241, 0.5);
      transform: translateY(-2px);
    }

    .priority-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .priority-badge.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .priority-badge.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
    .priority-badge.low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }

    .issue-card h4 {
      color: #fff;
      font-size: 14px;
      margin: 0 0 8px 0;
    }

    .issue-card p {
      color: rgba(255,255,255,0.5);
      font-size: 12px;
      margin: 0 0 12px 0;
      line-height: 1.5;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .assignee {
      font-size: 11px;
      color: rgba(255,255,255,0.4);
    }

    .assignee.unassigned {
      font-style: italic;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: #1a1a2e;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 32px;
      width: 100%;
      max-width: 500px;
    }

    .modal h2 {
      color: #fff;
      margin: 0 0 24px 0;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group label {
      display: block;
      color: rgba(255,255,255,0.8);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .form-group input, .form-group textarea, .form-group select {
      width: 100%;
      padding: 12px 16px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-group textarea {
      min-height: 100px;
      resize: vertical;
    }

    .form-group select {
      cursor: pointer;
    }

    .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
      outline: none;
      border-color: #6366f1;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    .btn-secondary {
      padding: 12px 24px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 10px;
      color: #fff;
      cursor: pointer;
    }
  `]
})
export class IssueBoardComponent implements OnInit {
  project: Project | null = null;
  issues: Issue[] = [];
  showCreateModal = false;
  projectId: string = '';

  newIssue = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TO_DO'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId') || '';
    this.loadProject();
    this.loadIssues();
  }

  loadProject() {
    this.http.get<Project>(`${environment.apiUrl}/projects/${this.projectId}`).subscribe({
      next: (project) => this.project = project,
      error: () => this.router.navigate(['/dashboard'])
    });
  }

  loadIssues() {
    this.http.get<Issue[]>(`${environment.apiUrl}/projects/${this.projectId}/issues`).subscribe({
      next: (issues) => this.issues = issues
    });
  }

  getIssuesByStatus(status: string): Issue[] {
    return this.issues.filter(i => i.status === status);
  }

  createIssue() {
    this.http.post<Issue>(`${environment.apiUrl}/projects/${this.projectId}/issues`, this.newIssue).subscribe({
      next: (issue) => {
        this.issues.push(issue);
        this.showCreateModal = false;
        this.newIssue = { title: '', description: '', priority: 'MEDIUM', status: 'TO_DO' };
      }
    });
  }
}
