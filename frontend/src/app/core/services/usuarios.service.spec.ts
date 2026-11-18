import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  const API = 'http://localhost:3000/api/usuarios';
  let service: UsuariosService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsuariosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('listar() hace GET a /usuarios', () => {
    service.listar().subscribe();
    expect(http.expectOne(API).request.method).toBe('GET');
  });

  it('crear() hace POST con los datos del usuario', () => {
    const datos = { nombre: 'Ana', email: 'ana@volta.es', password: 'secreto', rol: 'GESTOR' as const };
    service.crear(datos).subscribe();
    const req = http.expectOne(API);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(datos);
  });

  it('editar() hace PUT a /usuarios/:id con nombre y email', () => {
    service.editar(7, { nombre: 'Ana', email: 'ana@volta.es' }).subscribe();
    const req = http.expectOne(`${API}/7`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ nombre: 'Ana', email: 'ana@volta.es' });
  });

  it('cambiarRol() hace PATCH a /usuarios/:id/rol', () => {
    service.cambiarRol(7, 'ADMIN').subscribe();
    const req = http.expectOne(`${API}/7/rol`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ rol: 'ADMIN' });
  });

  it('cambiarEstado() hace PATCH a /usuarios/:id/estado', () => {
    service.cambiarEstado(7, false).subscribe();
    const req = http.expectOne(`${API}/7/estado`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ activo: false });
  });
});
