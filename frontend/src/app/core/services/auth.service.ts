import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Role, User, LoginCredentials } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);

  // Usuario inicial de prueba para desarrollo local
  readonly currentUser = signal<User | null>({
    id: 1,
    nombre: 'Administrador Volta',
    email: 'admin@voltaerp.com',
    rol: 'ADMIN',
    activo: true,
  });

  readonly token = signal<string | null>('mock-jwt-token');

  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.rol ?? null);

  hasRole(allowedRoles: Role[]): boolean {
    const role = this.userRole();
    if (!role) {
      return false;
    }
    return allowedRoles.includes(role);
  }

  login(credentials: LoginCredentials): void {
    // Se conectará con HttpClient cuando el endpoint de backend esté listo
    console.log('Login credentials:', credentials);
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('token');
    void this.router.navigate(['/login']);
  }

  // Permite simular cambios de rol durante el desarrollo
  setMockRole(role: Role): void {
    this.currentUser.update((user) => (user ? { ...user, rol: role } : null));
  }
}
