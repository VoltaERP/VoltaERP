import { Role } from '../../core/models/user.model';

export const ROLES: Role[] = ['ADMIN', 'GESTOR', 'EMPLEADO'];

export const ETIQUETAS_ROL: Record<Role, string> = {
  ADMIN: 'Administrador',
  GESTOR: 'Gestor',
  EMPLEADO: 'Empleado',
};

export const CLASES_ROL: Record<Role, string> = {
  ADMIN: 'bg-blue-100 text-blue-800',
  GESTOR: 'bg-purple-100 text-purple-800',
  EMPLEADO: 'bg-gray-100 text-gray-800',
};
