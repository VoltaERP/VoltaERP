import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Usuarios } from './usuarios';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

const USUARIOS: User[] = [
  { id: 1, nombre: 'Admin Volta', email: 'admin@volta.es', rol: 'ADMIN', activo: true },
  { id: 2, nombre: 'Gema Gestora', email: 'gema@volta.es', rol: 'GESTOR', activo: true },
  { id: 3, nombre: 'Eloy Empleado', email: 'eloy@volta.es', rol: 'EMPLEADO', activo: false },
];

describe('Usuarios', () => {
  let fixture: ComponentFixture<Usuarios>;
  let httpMock: HttpTestingController;
  let el: HTMLElement;

  const filas = () => Array.from(el.querySelectorAll('tbody tr'));
  const nombresVisibles = () =>
    filas().map((f) =>
      f.querySelector('th > div > span:last-child')?.textContent?.replace('(tú)', '').trim(),
    );

  async function seleccionar(id: string, valor: string): Promise<void> {
    const select = el.querySelector<HTMLSelectElement>(`#${id}`)!;
    select.value = valor;
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Usuarios],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    TestBed.inject(AuthService).currentUser.set(USUARIOS[0]);
    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(Usuarios);
    el = fixture.nativeElement;
    httpMock.expectOne('http://localhost:3000/api/usuarios').flush(USUARIOS);
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('muestra todos los usuarios ordenados por nombre', () => {
    expect(nombresVisibles()).toEqual(['Admin Volta', 'Eloy Empleado', 'Gema Gestora']);
    expect(el.textContent).toContain('Mostrando 3 de 3 usuarios');
  });

  it('marca la fila del usuario actual con "(tú)"', () => {
    expect(filas()[0].textContent).toContain('(tú)');
    expect(filas()[1].textContent).not.toContain('(tú)');
  });

  it('filtra por rol', async () => {
    await seleccionar('filtro-rol', 'GESTOR');
    expect(nombresVisibles()).toEqual(['Gema Gestora']);
  });

  it('filtra por estado', async () => {
    await seleccionar('filtro-estado', 'INACTIVO');
    expect(nombresVisibles()).toEqual(['Eloy Empleado']);
  });

  it('filtra por texto en nombre o email', async () => {
    const input = el.querySelector<HTMLInputElement>('#buscar-usuario')!;
    input.value = 'gema@';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(nombresVisibles()).toEqual(['Gema Gestora']);
  });

  it('deshabilita cambiar rol y desactivar en la fila propia', async () => {
    filas()[0].querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!.click();
    await fixture.whenStable();

    const opciones = Array.from(filas()[0].querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
    const opcion = (texto: string) => opciones.find((b) => b.textContent?.includes(texto))!;
    expect(opcion('Editar').disabled).toBe(false);
    expect(opcion('Cambiar rol').disabled).toBe(true);
    expect(opcion('Desactivar').disabled).toBe(true);
  });

  it('habilita cambiar rol y desactivar en la fila de otro usuario', async () => {
    const filaGema = filas()[2];
    filaGema.querySelector<HTMLButtonElement>('button[aria-haspopup="menu"]')!.click();
    await fixture.whenStable();

    const opciones = Array.from(filaGema.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
    expect(opciones.every((b) => !b.disabled)).toBe(true);
  });

  it('muestra un error con opción de reintentar si falla la carga', async () => {
    const reintentar = () => el.querySelector<HTMLButtonElement>('[role="alert"] button');
    fixture.componentInstance['cargarUsuarios']();
    httpMock
      .expectOne('http://localhost:3000/api/usuarios')
      .flush({}, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(el.textContent).toContain('No se pudieron cargar los usuarios');
    reintentar()!.click();
    httpMock.expectOne('http://localhost:3000/api/usuarios').flush(USUARIOS);
    await fixture.whenStable();
    expect(filas().length).toBe(3);
  });
});
