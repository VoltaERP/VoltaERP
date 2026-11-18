import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => httpMock.verify());

  it('añade la cabecera Authorization cuando hay token', () => {
    authService.token.set('abc123');
    http.get('/api/usuarios').subscribe();
    const req = httpMock.expectOne('/api/usuarios');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
  });

  it('no añade la cabecera cuando no hay token', () => {
    authService.token.set(null);
    http.get('/api/usuarios').subscribe();
    expect(httpMock.expectOne('/api/usuarios').request.headers.has('Authorization')).toBe(false);
  });

  it('cierra la sesión si la API responde 401', () => {
    const logout = vi.spyOn(authService, 'logout').mockImplementation(() => undefined);
    http.get('/api/usuarios').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/usuarios').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(logout).toHaveBeenCalled();
  });

  it('no cierra la sesión con un 401 del propio login', () => {
    const logout = vi.spyOn(authService, 'logout').mockImplementation(() => undefined);
    http.post('/api/auth/login', {}).subscribe({ error: () => undefined });
    httpMock.expectOne('/api/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(logout).not.toHaveBeenCalled();
  });

  it('no cierra la sesión con un 403 (sin permisos)', () => {
    const logout = vi.spyOn(authService, 'logout').mockImplementation(() => undefined);
    http.get('/api/usuarios').subscribe({ error: () => undefined });
    httpMock.expectOne('/api/usuarios').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(logout).not.toHaveBeenCalled();
  });
});
