import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.currentUserSubject.next(JSON.parse(savedUser));
        }
    }

    login(email: string, password: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
            tap(response => {
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('refreshToken', response.refreshToken);
                    const user: User = {
                        id: response.id,
                        email: response.email,
                        fullName: response.fullName,
                        roles: response.roles
                    };
                    localStorage.setItem('user', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                }
            })
        );
    }

    register(fullName: string, email: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, { fullName, email, password });
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }
}
