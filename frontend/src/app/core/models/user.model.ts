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

export interface CrearUsuarioDto {
  nombre: string;
  email: string;
  password: string;
  rol: Role;
}

export interface EditarUsuarioDto {
  nombre: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: Role;
  };
}
