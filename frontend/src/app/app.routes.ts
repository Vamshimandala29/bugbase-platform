import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { IssueBoardComponent } from './pages/issue-board/issue-board.component';
import { IssueDetailComponent } from './pages/issue-detail/issue-detail.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'projects/:projectId/board', component: IssueBoardComponent, canActivate: [authGuard] },
    { path: 'issues/:issueId', component: IssueDetailComponent, canActivate: [authGuard] },
    { path: 'users', component: UserManagementComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '/login' }
];
