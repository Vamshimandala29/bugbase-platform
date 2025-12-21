import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Project {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="dashboard">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo">
          <span class="logo-icon">🐛</span>
          <span class="logo-text">BugBase</span>
        </div>
        
        <nav class="nav-menu">
          <a class="nav-item active" routerLink="/dashboard">
            <span class="nav-icon">📊</span>
            Dashboard
          </a>
          <a class="nav-item" routerLink="/users" *ngIf="isAdmin()">
            <span class="nav-icon">👥</span>
            Users
          </a>
        </nav>
        
        <div class="user-section">
          <div class="user-info">
            <div class="user-avatar">{{ user?.fullName?.charAt(0) || 'U' }}</div>
            <div class="user-details">
              <span class="user-name">{{ user?.fullName }}</span>
              <span class="user-email">{{ user?.email }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="main-content">
        <header class="header">
          <h1>Dashboard</h1>
          <button class="btn-primary" (click)="showCreateModal = true">
            + New Project
          </button>
        </header>
        
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📁</div>
            <div class="stat-info">
              <span class="stat-value">{{ projects.length }}</span>
              <span class="stat-label">Projects</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🐞</div>
            <div class="stat-info">
              <span class="stat-value">0</span>
              <span class="stat-label">Open Issues</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <span class="stat-value">0</span>
              <span class="stat-label">Completed</span>
            </div>
          </div>
        </div>
        
        <!-- Projects List -->
        <section class="projects-section">
          <h2>Your Projects</h2>
          
          <div *ngIf="loading" class="loading">Loading projects...</div>
          
          <div *ngIf="!loading && projects.length === 0" class="empty-state">
            <span class="empty-icon">📁</span>
            <h3>No projects yet</h3>
            <p>Create your first project to start tracking bugs</p>
            <button class="btn-primary" (click)="showCreateModal = true">Create Project</button>
          </div>
          
          <div class="projects-grid" *ngIf="projects.length > 0">
            <div class="project-card" *ngFor="let project of projects" [routerLink]="['/projects', project.id, 'board']">
              <h3>{{ project.name }}</h3>
              <p>{{ project.description || 'No description' }}</p>
              <div class="project-meta">
                <span>Created: {{ project.createdAt | date:'short' }}</span>
              </div>
              <div class="project-action">
                <span class="view-board">View Board →</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <!-- Create Project Modal -->
      <div class="modal-overlay" *ngIf="showCreateModal" (click)="showCreateModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h2>Create New Project</h2>
          <form (ngSubmit)="createProject()">
            <div class="form-group">
              <label>Project Name</label>
              <input type="text" [(ngModel)]="newProject.name" name="name" placeholder="My Awesome Project" required>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="newProject.description" name="description" placeholder="Describe your project..."></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="showCreateModal = false">Cancel</button>
              <button type="submit" class="btn-primary">Create</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .dashboard {
      display: flex;
      min-height: 100vh;
      background: #0f0f17;
    }
    
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1a1a2e 0%, #16162a 100%);
      padding: 24px;
      display: flex;
      flex-direction: column;
      border-right: 1px solid rgba(255,255,255,0.05);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 40px;
    }
    
    .logo-icon { font-size: 28px; }
    
    .logo-text {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
    }
    
    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
    }
    
    .nav-item:hover, .nav-item.active {
      background: rgba(99, 102, 241, 0.15);
      color: #fff;
    }
    
    .nav-item.active {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    
    .nav-icon { font-size: 18px; }
    
    .user-section {
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 20px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
      font-size: 16px;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      color: #fff;
      font-weight: 500;
      font-size: 14px;
    }
    
    .user-email {
      color: rgba(255,255,255,0.5);
      font-size: 12px;
    }
    
    .logout-btn {
      width: 100%;
      padding: 10px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #ef4444;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.2);
    }
    
    .main-content {
      flex: 1;
      padding: 32px;
      overflow-y: auto;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    
    .header h1 {
      color: #fff;
      font-size: 28px;
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
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      gap: 16px;
      align-items: center;
    }
    
    .stat-icon {
      font-size: 32px;
      background: rgba(99, 102, 241, 0.15);
      padding: 16px;
      border-radius: 12px;
    }
    
    .stat-info {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
    }
    
    .stat-label {
      color: rgba(255,255,255,0.5);
      font-size: 14px;
    }
    
    .projects-section h2 {
      color: #fff;
      font-size: 20px;
      margin-bottom: 20px;
    }
    
    .loading, .empty-state {
      text-align: center;
      padding: 60px;
      color: rgba(255,255,255,0.5);
    }
    
    .empty-icon {
      font-size: 64px;
      display: block;
      margin-bottom: 16px;
    }
    
    .empty-state h3 {
      color: #fff;
      margin-bottom: 8px;
    }
    
    .empty-state p {
      margin-bottom: 24px;
    }
    
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    
    .project-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 24px;
      transition: all 0.2s;
      cursor: pointer;
    }
    
    .project-card:hover {
      border-color: rgba(99, 102, 241, 0.5);
      transform: translateY(-4px);
    }
    
    .project-card h3 {
      color: #fff;
      margin: 0 0 8px 0;
    }
    
    .project-card p {
      color: rgba(255,255,255,0.5);
      margin: 0 0 16px 0;
      font-size: 14px;
    }
    
    .project-meta {
      font-size: 12px;
      color: rgba(255,255,255,0.3);
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
      max-width: 450px;
    }
    
    .modal h2 {
      color: #fff;
      margin: 0 0 24px 0;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      color: rgba(255,255,255,0.8);
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .form-group input, .form-group textarea {
      width: 100%;
      padding: 12px 16px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 16px;
      box-sizing: border-box;
    }
    
    .form-group textarea {
      min-height: 100px;
      resize: vertical;
    }
    
    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: #6366f1;
    }
    
    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    
    .btn-secondary {
      padding: 12px 24px;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 10px;
      color: #fff;
      cursor: pointer;
    }

    .project-action {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }

    .view-board {
      color: #6366f1;
      font-size: 13px;
      font-weight: 500;
    }
  `]
})
export class DashboardComponent implements OnInit {
    user: User | null = null;
    projects: Project[] = [];
    loading = true;
    showCreateModal = false;
    newProject = { name: '', description: '' };

    constructor(
        private authService: AuthService,
        private router: Router,
        private http: HttpClient
    ) { }

    ngOnInit() {
        this.user = this.authService.getCurrentUser();
        this.loadProjects();
    }

    loadProjects() {
        this.http.get<Project[]>(`${environment.apiUrl}/projects`).subscribe({
            next: (projects) => {
                this.projects = projects;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    createProject() {
        this.http.post<Project>(`${environment.apiUrl}/projects`, this.newProject).subscribe({
            next: (project) => {
                this.projects.push(project);
                this.showCreateModal = false;
                this.newProject = { name: '', description: '' };
            }
        });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    isAdmin(): boolean {
        return this.user?.roles?.includes('ROLE_ADMIN') || false;
    }
}
