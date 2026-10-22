import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {HttpClient} from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Role, User, LoginCredentials, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = 'http://localhost:3000/api/auth';

  // Recuperar sesión persitida en localStorage al arrancar
  readonly currentUser = signal<User | null>(this.loadUserFromStorage());
  readonly token = signal<string | null>(localStorage.getItem('token'));

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.rol ?? null);

  hasRole(allowedRoles: Role[]): boolean {
    const role = this.userRole();
    if (!role) {
      return false;
    }
    return allowedRoles.includes(role);
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        const user: User = {...response.usuario, activo: true};
        this.currentUser.set(user);
        this.token.set(response.token);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    void this.router.navigate(['/login']);
  }

  private loadUserFromStorage(): User | null {
      try {
        const raw = localStorage.getItem('user');
        return raw ? (JSON.parse(raw) as User) : null;
      } catch {
        return null;
      }
  }
}
