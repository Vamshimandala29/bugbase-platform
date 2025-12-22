import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
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
    private supabase: SupabaseClient;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

        // Listen to auth changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                this.updateCurrentUser(session.user);
            } else {
                this.currentUserSubject.next(null);
            }
        });

        // Initialize user
        this.supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                this.updateCurrentUser(session.user);
            }
        });
    }

    private updateCurrentUser(sbUser: SupabaseUser) {
        const user: User = {
            id: sbUser.id,
            email: sbUser.email || '',
            fullName: sbUser.user_metadata?.['full_name'] || sbUser.email?.split('@')[0] || 'User',
            roles: sbUser.user_metadata?.['roles'] || ['ROLE_MEMBER']
        };
        this.currentUserSubject.next(user);
    }

    login(email: string, password: string): Observable<any> {
        return from(this.supabase.auth.signInWithPassword({ email, password })).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data;
            })
        );
    }

    register(fullName: string, email: string, password: string): Observable<any> {
        return from(this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    roles: ['ROLE_MEMBER']
                }
            }
        })).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return data;
            })
        );
    }

    logout(): void {
        this.supabase.auth.signOut();
        this.currentUserSubject.next(null);
    }

    async getToken(): Promise<string | null> {
        const { data: { session } } = await this.supabase.auth.getSession();
        return session?.access_token || null;
    }

    isLoggedIn(): boolean {
        return !!this.currentUserSubject.value;
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }
}
