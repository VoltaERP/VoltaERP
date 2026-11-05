import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormField,
  applyWhen,
  email,
  form,
  hidden,
  minLength,
  required,
  submit,
} from '@angular/forms/signals';
import { Observable, firstValueFrom } from 'rxjs';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Role, User } from '../../../core/models/user.model';
import { ETIQUETAS_ROL, ROLES } from '../etiquetas-rol';

interface UsuarioFormModel {
  nombre: string;
  email: string;
  password: string;
  rol: Role;
}

/**
 * Modal de alta / edición de usuario.
 * Sin `usuario` => alta (nombre, email, contraseña y rol).
 * Con `usuario` => edición (nombre y email; el rol se cambia desde su propia acción).
 */
@Component({
  imports: [FormField],
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.html',
})
export class UsuarioForm {
  private readonly usuariosService = inject(UsuariosService);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  readonly usuario = input<User | null>(null);
  readonly guardado = output<User>();
  readonly cerrado = output<void>();

  protected readonly roles = ROLES;
  protected readonly etiquetasRol = ETIQUETAS_ROL;
  protected readonly esEdicion = computed(() => this.usuario() !== null);
  protected readonly errorGeneral = signal<string | null>(null);

  private readonly modelo = linkedSignal<UsuarioFormModel>(() => {
    const u = this.usuario();
    return { nombre: u?.nombre ?? '', email: u?.email ?? '', password: '', rol: u?.rol ?? 'EMPLEADO' };
  });

  protected readonly formulario = form(this.modelo, (f) => {
    required(f.nombre, { message: 'El nombre es obligatorio' });
    required(f.email, { message: 'El email es obligatorio' });
    email(f.email, { message: 'Introduce un email válido' });
    hidden(f.password, () => this.esEdicion());
    hidden(f.rol, () => this.esEdicion());
    applyWhen(f.password, () => !this.esEdicion(), (password) => {
      required(password, { message: 'La contraseña es obligatoria' });
      minLength(password, 6, { message: 'La contraseña debe tener al menos 6 caracteres' });
    });
  });

  constructor() {
    afterNextRender(() => this.dialogo().nativeElement.showModal());
  }

  protected async guardar(event: Event): Promise<void> {
    event.preventDefault();
    this.errorGeneral.set(null);

    await submit(this.formulario, {
      action: async (f) => {
        const { nombre, email: correo, password, rol } = f().value();
        const peticion: Observable<User> = this.esEdicion()
          ? this.usuariosService.editar(this.usuario()!.id, { nombre, email: correo })
          : this.usuariosService.crear({ nombre, email: correo, password, rol });

        try {
          const usuario = await firstValueFrom(peticion);
          this.guardado.emit(usuario);
          this.cerrar();
          return undefined;
        } catch (error: unknown) {
          const mensaje = this.mensajeDeError(error);
          if (/email/i.test(mensaje)) {
            return { fieldTree: f.email, kind: 'server', message: 'Este email ya está en uso' };
          }
          this.errorGeneral.set(mensaje);
          return undefined;
        }
      },
    });
  }

  protected cerrar(): void {
    this.dialogo().nativeElement.close();
  }

  /** Se dispara al cerrar el <dialog> por cualquier vía (botón, Escape o tras guardar). */
  protected onDialogoCerrado(): void {
    this.cerrado.emit();
  }

  private mensajeDeError(error: unknown): string {
    if (error instanceof HttpErrorResponse && typeof error.error?.error === 'string') {
      return error.error.error;
    }
    return 'No se pudo guardar el usuario. Inténtalo de nuevo.';
  }
}
