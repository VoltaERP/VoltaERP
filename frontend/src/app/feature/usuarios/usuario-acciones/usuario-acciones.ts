import { Component, ElementRef, afterRenderEffect, inject, input, output, signal, viewChild } from '@angular/core';
import { User } from '../../../core/models/user.model';

/** Menú desplegable "⋯" con las acciones de una fila de usuario. */
@Component({
  selector: 'app-usuario-acciones',
  host: {
    class: 'relative inline-block',
    '(document:click)': 'onClickFuera($event)',
    '(keydown.escape)': 'cerrar(true)',
  },
  template: `
    <button
      #boton
      type="button"
      (click)="alternar()"
      [attr.aria-expanded]="abierto()"
      [attr.aria-controls]="idMenu"
      aria-haspopup="menu"
      [attr.aria-label]="'Acciones para ' + usuario().nombre"
      class="inline-flex w-8 h-8 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="5" cy="12" r="1.75" /><circle cx="12" cy="12" r="1.75" /><circle cx="19" cy="12" r="1.75" />
      </svg>
    </button>

    @if (abierto()) {
      <ul
        #menu
        [id]="idMenu"
        role="menu"
        [attr.aria-label]="'Acciones para ' + usuario().nombre"
        class="absolute right-0 z-10 mt-1 w-44 rounded-lg border border-gray-100 bg-white py-1 text-sm text-gray-700 shadow-lg"
      >
        <li role="none">
          <button
            type="button"
            role="menuitem"
            (click)="onEditar()"
            class="block w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
          >
            Editar
          </button>
        </li>
        <li role="none">
          <button
            type="button"
            role="menuitem"
            (click)="onCambiarRol()"
            [disabled]="esUsuarioActual()"
            class="block w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-500 disabled:hover:bg-transparent"
          >
            Cambiar rol
            @if (esUsuarioActual()) {
              <span class="block text-xs text-gray-600">No puedes cambiar tu propio rol</span>
            }
          </button>
        </li>
        <li role="none" class="border-t border-gray-100 mt-1 pt-1">
          <button
            type="button"
            role="menuitem"
            (click)="onCambiarEstado()"
            [disabled]="esUsuarioActual()"
            class="block w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none disabled:cursor-not-allowed disabled:text-gray-500 disabled:hover:bg-transparent"
            [class]="usuario().activo ? 'text-red-700' : 'text-green-800'"
          >
            {{ usuario().activo ? 'Desactivar' : 'Activar' }}
            @if (esUsuarioActual()) {
              <span class="block text-xs text-gray-600">No puedes desactivarte a ti mismo</span>
            }
          </button>
        </li>
      </ul>
    }
  `,
})
export class UsuarioAcciones {
  private static siguienteId = 0;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');
  private readonly menu = viewChild<ElementRef<HTMLUListElement>>('menu');

  readonly usuario = input.required<User>();
  readonly esUsuarioActual = input(false);
  readonly editar = output<void>();
  readonly cambiarRol = output<void>();
  readonly cambiarEstado = output<void>();

  protected readonly abierto = signal(false);
  protected readonly idMenu = `menu-acciones-${UsuarioAcciones.siguienteId++}`;

  constructor() {
    // Al abrir, el foco pasa a la primera opción del menú.
    afterRenderEffect(() => {
      this.menu()?.nativeElement.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    });
  }

  protected alternar(): void {
    this.abierto.update((v) => !v);
  }

  protected cerrar(devolverFoco = false): void {
    if (!this.abierto()) {
      return;
    }
    this.abierto.set(false);
    if (devolverFoco) {
      this.boton().nativeElement.focus();
    }
  }

  protected onEditar(): void {
    this.cerrar();
    this.editar.emit();
  }

  protected onCambiarRol(): void {
    if (this.esUsuarioActual()) {
      return;
    }
    this.cerrar();
    this.cambiarRol.emit();
  }

  protected onCambiarEstado(): void {
    if (this.esUsuarioActual()) {
      return;
    }
    this.cerrar();
    this.cambiarEstado.emit();
  }

  protected onClickFuera(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.cerrar();
    }
  }
}
