import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="logo">
          <span class="logo-icon">🐛</span>
          <h1>BugBase</h1>
        </div>
        <h2>Welcome Back</h2>
        <p class="subtitle">Sign in to your account</p>
        
        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              [(ngModel)]="email" 
              name="email" 
              placeholder="you@example.com"
              required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              [(ngModel)]="password" 
              name="password" 
              placeholder="••••••••"
              required>
          </div>
          
          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>
          
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        
        <p class="auth-link">
          Don't have an account? <a routerLink="/register">Create one</a>
        </p>
      </div>
    </div>
  `,
    styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
      padding: 20px;
    }
    
    .auth-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
    }
    
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 30px;
    }
    
    .logo-icon {
      font-size: 32px;
    }
    
    .logo h1 {
      color: #fff;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    
    h2 {
      color: #fff;
      text-align: center;
      margin: 0 0 8px 0;
      font-size: 24px;
    }
    
    .subtitle {
      color: rgba(255, 255, 255, 0.6);
      text-align: center;
      margin: 0 0 30px 0;
    }
    
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .form-group label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
      font-weight: 500;
    }
    
    .form-group input {
      padding: 12px 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    
    .form-group input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }
    
    .btn-primary {
      padding: 14px 24px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-top: 10px;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
    }
    
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .error-message {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      padding: 12px;
      color: #ef4444;
      font-size: 14px;
      text-align: center;
    }
    
    .auth-link {
      text-align: center;
      margin-top: 24px;
      color: rgba(255, 255, 255, 0.6);
    }
    
    .auth-link a {
      color: #6366f1;
      text-decoration: none;
      font-weight: 500;
    }
    
    .auth-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
    email = '';
    password = '';
    error = '';
    loading = false;

    constructor(private authService: AuthService, private router: Router) { }

    onSubmit() {
        this.loading = true;
        this.error = '';

        this.authService.login(this.email, this.password).subscribe({
            next: () => {
                this.router.navigate(['/dashboard']);
            },
            error: (err) => {
                this.loading = false;
                console.error('Login error:', err);
                this.error = err.message || 'Login failed. Please check your credentials.';
            }
        });
    }
}
