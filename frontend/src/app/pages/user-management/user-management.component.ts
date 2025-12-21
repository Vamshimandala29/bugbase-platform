import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'MEMBER' | 'VIEWER';
    createdAt: string;
}

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="management-container">
      <header class="page-header">
        <div class="header-left">
          <a routerLink="/dashboard" class="back-btn">← Back to Dashboard</a>
          <h1>👥 User Management</h1>
        </div>
      </header>

      <div class="content-card">
        <div class="table-header">
          <h2>All Users</h2>
          <span class="user-count">{{ users.length }} users</span>
        </div>

        <table class="users-table" *ngIf="users.length > 0">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td class="user-cell">
                <div class="user-avatar">{{ user.fullName.charAt(0) }}</div>
                <span>{{ user.fullName }}</span>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <select [(ngModel)]="user.role" (change)="updateRole(user)" class="role-select" [class]="user.role.toLowerCase()">
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </td>
              <td>{{ user.createdAt | date:'mediumDate' }}</td>
              <td>
                <button class="delete-btn" (click)="deleteUser(user)" title="Delete user">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="empty-state" *ngIf="users.length === 0 && !loading">
          <p>No users found.</p>
        </div>

        <div class="loading" *ngIf="loading">Loading users...</div>

        <div class="error-state" *ngIf="error">
          <p>{{ error }}</p>
          <button class="btn-primary" (click)="loadUsers()">Retry</button>
        </div>
      </div>

      <div class="role-legend">
        <h3>Role Permissions</h3>
        <div class="legend-item">
          <span class="role-badge admin">ADMIN</span>
          <span>Full access - manage users, projects, and all issues</span>
        </div>
        <div class="legend-item">
          <span class="role-badge member">MEMBER</span>
          <span>Can create and update projects and issues</span>
        </div>
        <div class="legend-item">
          <span class="role-badge viewer">VIEWER</span>
          <span>Read-only access to projects and issues</span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .management-container {
      min-height: 100vh;
      background: #0f0f17;
      padding: 24px;
    }

    .page-header {
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

    .page-header h1 {
      color: #fff;
      font-size: 24px;
      margin: 0;
    }

    .content-card {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .table-header h2 {
      color: #fff;
      font-size: 18px;
      margin: 0;
    }

    .user-count {
      color: rgba(255,255,255,0.5);
      font-size: 14px;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table th {
      text-align: left;
      padding: 12px 16px;
      color: rgba(255,255,255,0.5);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .users-table td {
      padding: 16px;
      color: rgba(255,255,255,0.8);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    .users-table tr:hover {
      background: rgba(255,255,255,0.02);
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-weight: 600;
      font-size: 14px;
    }

    .role-select {
      padding: 8px 12px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      color: #fff;
      cursor: pointer;
      font-size: 13px;
    }

    .role-select.admin {
      border-color: rgba(239, 68, 68, 0.5);
      background: rgba(239, 68, 68, 0.1);
    }

    .role-select.member {
      border-color: rgba(59, 130, 246, 0.5);
      background: rgba(59, 130, 246, 0.1);
    }

    .role-select.viewer {
      border-color: rgba(34, 197, 94, 0.5);
      background: rgba(34, 197, 94, 0.1);
    }

    .delete-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      opacity: 0.5;
      transition: opacity 0.2s;
    }

    .delete-btn:hover {
      opacity: 1;
    }

    .loading, .empty-state, .error-state {
      text-align: center;
      padding: 40px;
      color: rgba(255,255,255,0.5);
    }

    .error-state {
      color: #ef4444;
    }

    .btn-primary {
      padding: 10px 20px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      margin-top: 12px;
    }

    .role-legend {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 24px;
    }

    .role-legend h3 {
      color: #fff;
      font-size: 16px;
      margin: 0 0 16px 0;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      color: rgba(255,255,255,0.6);
      font-size: 14px;
    }

    .role-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      min-width: 60px;
      text-align: center;
    }

    .role-badge.admin { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .role-badge.member { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
    .role-badge.viewer { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
  `]
})
export class UserManagementComponent implements OnInit {
    users: User[] = [];
    loading = true;
    error = '';

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.error = '';
        this.http.get<User[]>(`${environment.apiUrl}/users`).subscribe({
            next: (users) => {
                this.users = users;
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                if (err.status === 403) {
                    this.error = 'Access denied. Admin privileges required.';
                } else {
                    this.error = 'Failed to load users.';
                }
            }
        });
    }

    updateRole(user: User) {
        this.http.patch(`${environment.apiUrl}/users/${user.id}/role`, { role: user.role }).subscribe({
            error: () => alert('Failed to update role')
        });
    }

    deleteUser(user: User) {
        if (!confirm(`Are you sure you want to delete ${user.fullName}?`)) return;
        this.http.delete(`${environment.apiUrl}/users/${user.id}`).subscribe({
            next: () => {
                this.users = this.users.filter(u => u.id !== user.id);
            },
            error: () => alert('Failed to delete user')
        });
    }
}
