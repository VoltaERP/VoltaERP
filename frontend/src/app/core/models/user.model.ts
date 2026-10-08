export type Role = 'ADMIN' | 'GESTOR' | 'EMPLEADO';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: Role;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
