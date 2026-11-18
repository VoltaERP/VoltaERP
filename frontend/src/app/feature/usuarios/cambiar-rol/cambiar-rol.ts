import { Component, ElementRef, afterNextRender, computed, inject, input, linkedSignal, output, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Role, User } from '../../../core/models/user.model';
import { ETIQUETAS_ROL, ROLES } from '../etiquetas-rol';

const DESCRIPCIONES_ROL: Record<Role, string> = {
  ADMIN: 'Acceso total, incluida la gestión de usuarios y la configuración.',
  GESTOR: 'Gestiona terceros, catálogo, ventas y compras.',
  EMPLEADO: 'Acceso básico a las operaciones del día a día.',
};

/** Modal para cambiar el rol de un usuario. */
@Component({
  selector: 'app-cambiar-rol',
  templateUrl: './cambiar-rol.html',
})
export class CambiarRol {
  private readonly usuariosService = inject(UsuariosService);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  readonly usuario = input.required<User>();
  readonly guardado = output<User>();
  readonly cerrado = output<void>();

  protected readonly roles = ROLES;
  protected readonly etiquetasRol = ETIQUETAS_ROL;
  protected readonly descripciones = DESCRIPCIONES_ROL;

  protected readonly rolSeleccionado = linkedSignal(() => this.usuario().rol);
  protected readonly sinCambios = computed(() => this.rolSeleccionado() === this.usuario().rol);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.dialogo().nativeElement.showModal());
  }

  protected seleccionar(rol: Role): void {
    this.rolSeleccionado.set(rol);
  }

  protected guardar(event: Event): void {
    event.preventDefault();
    if (this.sinCambios() || this.guardando()) {
      return;
    }
    this.guardando.set(true);
    this.error.set(null);

    this.usuariosService.cambiarRol(this.usuario().id, this.rolSeleccionado()).subscribe({
      next: (usuario) => {
        this.guardado.emit(usuario);
        this.cerrar();
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        this.error.set(
          err instanceof HttpErrorResponse && typeof err.error?.error === 'string'
            ? err.error.error
            : 'No se pudo cambiar el rol. Inténtalo de nuevo.',
        );
      },
    });
  }

  protected cerrar(): void {
    this.dialogo().nativeElement.close();
  }
}
