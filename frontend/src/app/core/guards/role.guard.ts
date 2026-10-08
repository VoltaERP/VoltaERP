import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as Role[] | undefined;

  // Si la ruta no especifica roles, se permite el acceso
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  // Si el usuario tiene alguno de los roles permitidos
  if (authService.hasRole(allowedRoles)) {
    return true;
  }

  // Redirigir al dashboard si no tiene autorización
  return router.createUrlTree(['/dashboard']);
};
