import { Component, ElementRef, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { User } from '../../../core/models/user.model';

/** Diálogo de confirmación para activar o desactivar un usuario. */
@Component({
  selector: 'app-cambiar-estado',
  template: `
    <dialog
      #dialogo
      role="alertdialog"
      aria-labelledby="titulo-cambiar-estado"
      aria-describedby="desc-cambiar-estado"
      (close)="cerrado.emit()"
      class="m-auto w-full max-w-md rounded-lg bg-white p-0 shadow-xl backdrop:bg-gray-900/50"
    >
      <div class="p-5 text-center">
        <span
          class="mx-auto mb-4 inline-flex w-12 h-12 items-center justify-center rounded-full"
          [class]="desactivar() ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'"
          aria-hidden="true"
        >
          @if (desactivar()) {
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          } @else {
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          }
        </span>

        <h2 id="titulo-cambiar-estado" class="text-lg font-semibold text-gray-900">
          {{ desactivar() ? 'Desactivar' : 'Activar' }} a {{ usuario().nombre }}
        </h2>
        <p id="desc-cambiar-estado" class="mt-2 text-sm text-gray-600">
          @if (desactivar()) {
            No podrá iniciar sesión hasta que lo vuelvas a activar. Sus datos y su historial se conservan.
          } @else {
            Podrá volver a iniciar sesión con su email y contraseña.
          }
        </p>

        @if (error()) {
          <p class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{{ error() }}</p>
        }

        <div class="mt-5 flex justify-center gap-3">
          <button
            type="button"
            autofocus
            (click)="cerrar()"
            class="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            (click)="confirmar()"
            [disabled]="guardando()"
            class="rounded-lg px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
            [class]="desactivar() ? 'bg-red-700 hover:bg-red-800 focus:ring-red-300' : 'bg-green-700 hover:bg-green-800 focus:ring-green-300'"
          >
            {{ guardando() ? 'Guardando…' : desactivar() ? 'Sí, desactivar' : 'Sí, activar' }}
          </button>
        </div>
      </div>
    </dialog>
  `,
})
export class CambiarEstado {
  private readonly usuariosService = inject(UsuariosService);
  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  readonly usuario = input.required<User>();
  readonly guardado = output<User>();
  readonly cerrado = output<void>();

  /** true si la acción es desactivar (el usuario está activo ahora). */
  protected readonly desactivar = computed(() => this.usuario().activo);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.dialogo().nativeElement.showModal());
  }

  protected confirmar(): void {
    if (this.guardando()) {
      return;
    }
    this.guardando.set(true);
    this.error.set(null);

    this.usuariosService.cambiarEstado(this.usuario().id, !this.usuario().activo).subscribe({
      next: (usuario) => {
        this.guardado.emit(usuario);
        this.cerrar();
      },
      error: (err: unknown) => {
        this.guardando.set(false);
        this.error.set(
          err instanceof HttpErrorResponse && typeof err.error?.error === 'string'
            ? err.error.error
            : 'No se pudo cambiar el estado. Inténtalo de nuevo.',
        );
      },
    });
  }

  protected cerrar(): void {
    this.dialogo().nativeElement.close();
  }
}
