import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UsuarioForm } from './usuario-form';
import { User } from '../../../core/models/user.model';

const API = 'http://localhost:3000/api/usuarios';

describe('UsuarioForm', () => {
  let fixture: ComponentFixture<UsuarioForm>;
  let httpMock: HttpTestingController;
  let el: HTMLElement;

  async function crear(usuario: User | null): Promise<void> {
    fixture = TestBed.createComponent(UsuarioForm);
    fixture.componentRef.setInput('usuario', usuario);
    el = fixture.nativeElement;
    await fixture.whenStable();
  }

  async function escribir(id: string, valor: string): Promise<void> {
    const control = el.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)!;
    control.value = valor;
    // Igual que el navegador: se disparan input y change.
    control.dispatchEvent(new Event('input'));
    control.dispatchEvent(new Event('change'));
    await fixture.whenStable();
  }

  async function enviar(): Promise<void> {
    el.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  /** Deja que terminen las promesas de submit() tras responder la petición. */
  async function esperarRespuesta(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();
  }

  beforeEach(async () => {
    // jsdom no siempre implementa showModal/close del <dialog>
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.open = true;
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    };

    await TestBed.configureTestingModule({
      imports: [UsuarioForm],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('alta', () => {
    beforeEach(() => crear(null));

    it('muestra los campos de contraseña y rol', () => {
      expect(el.querySelector('#usuario-password')).not.toBeNull();
      expect(el.querySelector('#usuario-rol')).not.toBeNull();
    });

    it('no llama a la API y muestra errores si el formulario está vacío', async () => {
      await enviar();
      httpMock.expectNone(API);
      expect(el.textContent).toContain('El nombre es obligatorio');
      expect(el.textContent).toContain('El email es obligatorio');
      expect(el.textContent).toContain('La contraseña es obligatoria');
    });

    it('valida formato de email y longitud de contraseña', async () => {
      await escribir('usuario-nombre', 'Ana');
      await escribir('usuario-email', 'no-es-email');
      await escribir('usuario-password', '123');
      await enviar();
      httpMock.expectNone(API);
      expect(el.textContent).toContain('Introduce un email válido');
      expect(el.textContent).toContain('al menos 6 caracteres');
    });

    it('crea el usuario y emite guardado', async () => {
      const guardado = vi.fn();
      fixture.componentInstance.guardado.subscribe(guardado);

      await escribir('usuario-nombre', 'Ana');
      await escribir('usuario-email', 'ana@volta.es');
      await escribir('usuario-password', 'secreto');
      await escribir('usuario-rol', 'GESTOR');
      await enviar();

      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ nombre: 'Ana', email: 'ana@volta.es', password: 'secreto', rol: 'GESTOR' });
      const creado: User = { id: 9, nombre: 'Ana', email: 'ana@volta.es', rol: 'GESTOR', activo: true };
      req.flush(creado);
      await esperarRespuesta();

      expect(guardado).toHaveBeenCalledWith(creado);
    });

    it('muestra el error en el campo email si ya está en uso', async () => {
      await escribir('usuario-nombre', 'Ana');
      await escribir('usuario-email', 'ana@volta.es');
      await escribir('usuario-password', 'secreto');
      await enviar();

      httpMock
        .expectOne(API)
        .flush({ error: 'El email ya está en uso' }, { status: 400, statusText: 'Bad Request' });
      await esperarRespuesta();

      expect(el.querySelector('#usuario-email-error')?.textContent).toContain('Este email ya está en uso');
    });
  });

  describe('edición', () => {
    const usuario: User = { id: 4, nombre: 'Gema', email: 'gema@volta.es', rol: 'GESTOR', activo: true };
    beforeEach(() => crear(usuario));

    it('precarga los datos y oculta contraseña y rol', () => {
      expect(el.querySelector<HTMLInputElement>('#usuario-nombre')!.value).toBe('Gema');
      expect(el.querySelector<HTMLInputElement>('#usuario-email')!.value).toBe('gema@volta.es');
      expect(el.querySelector('#usuario-password')).toBeNull();
      expect(el.querySelector('#usuario-rol')).toBeNull();
    });

    it('envía solo nombre y email con PUT', async () => {
      await escribir('usuario-nombre', 'Gema López');
      await enviar();

      const req = httpMock.expectOne(`${API}/4`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ nombre: 'Gema López', email: 'gema@volta.es' });
      req.flush({ ...usuario, nombre: 'Gema López' });
    });
  });
});
