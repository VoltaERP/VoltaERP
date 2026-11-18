import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Añade el token JWT a todas las peticiones y cierra la sesión
 * si el backend responde 401 (token caducado o usuario inexistente).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      const esLogin = req.url.endsWith('/auth/login');
      if (error instanceof HttpErrorResponse && error.status === 401 && !esLogin) {
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
