import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../core/services/usuarios.service';
import { AuthService } from '../../core/services/auth.service';
import { Role, User } from '../../core/models/user.model';
import { CLASES_ROL, ETIQUETAS_ROL, ROLES } from './etiquetas-rol';
import { UsuarioForm } from './usuario-form/usuario-form';
import { UsuarioAcciones } from './usuario-acciones/usuario-acciones';
import { CambiarRol } from './cambiar-rol/cambiar-rol';
import { CambiarEstado } from './cambiar-estado/cambiar-estado';

type FiltroEstado = 'TODOS' | 'ACTIVO' | 'INACTIVO';
type FiltroRol = 'TODOS' | Role;

interface FilaUsuario extends User {
  iniciales: string;
  esUsuarioActual: boolean;
}

/** Modal abierto: ninguno, formulario (alta si usuario es null, si no edición) o cambio de rol. */
type EstadoModal =
  | { tipo: 'ninguno' }
  | { tipo: 'formulario'; usuario: User | null }
  | { tipo: 'rol'; usuario: User }
  | { tipo: 'estado'; usuario: User };

function obtenerIniciales(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join('');
}

@Component({
  imports: [RouterLink, UsuarioForm, UsuarioAcciones, CambiarRol, CambiarEstado],
  selector: 'app-usuarios',
  templateUrl: './usuarios.html',
})
export class Usuarios {
  private readonly usuariosService = inject(UsuariosService);
  private readonly authService = inject(AuthService);

  protected readonly roles = ROLES;
  protected readonly etiquetasRol = ETIQUETAS_ROL;
  protected readonly clasesRol = CLASES_ROL;

  protected readonly usuarios = signal<User[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly modal = signal<EstadoModal>({ tipo: 'ninguno' });
  protected readonly aviso = signal<string | null>(null);

  protected readonly busqueda = signal('');
  protected readonly filtroRol = signal<FiltroRol>('TODOS');
  protected readonly filtroEstado = signal<FiltroEstado>('TODOS');

  protected readonly filas = computed<FilaUsuario[]>(() => {
    const idActual = this.authService.currentUser()?.id;
    const texto = this.busqueda().trim().toLowerCase();
    const rol = this.filtroRol();
    const estado = this.filtroEstado();

    return this.usuarios()
      .filter((u) => rol === 'TODOS' || u.rol === rol)
      .filter((u) => estado === 'TODOS' || u.activo === (estado === 'ACTIVO'))
      .filter(
        (u) =>
          !texto ||
          u.nombre.toLowerCase().includes(texto) ||
          u.email.toLowerCase().includes(texto),
      )
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      .map((u) => ({
        ...u,
        iniciales: obtenerIniciales(u.nombre),
        esUsuarioActual: u.id === idActual,
      }));
  });

  constructor() {
    this.cargarUsuarios();
  }

  protected cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.usuariosService.listar().subscribe({
      next: (usuarios) => {
        this.usuarios.set(usuarios);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios. Inténtalo de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  protected abrirAlta(): void {
    this.modal.set({ tipo: 'formulario', usuario: null });
  }

  protected abrirEdicion(usuario: User): void {
    this.modal.set({ tipo: 'formulario', usuario });
  }

  // Doble seguro: ambas opciones ya están deshabilitadas en la fila del usuario actual.
  protected abrirCambioRol(usuario: User): void {
    if (!this.esUsuarioActual(usuario)) {
      this.modal.set({ tipo: 'rol', usuario });
    }
  }

  protected abrirCambioEstado(usuario: User): void {
    if (!this.esUsuarioActual(usuario)) {
      this.modal.set({ tipo: 'estado', usuario });
    }
  }

  protected onEstadoCambiado(usuario: User): void {
    this.guardarEnLista(usuario);
    this.aviso.set(`Usuario «${usuario.nombre}» ${usuario.activo ? 'activado' : 'desactivado'}.`);
  }

  private esUsuarioActual(usuario: User): boolean {
    return usuario.id === this.authService.currentUser()?.id;
  }

  protected cerrarModal(): void {
    this.modal.set({ tipo: 'ninguno' });
  }

  /** Inserta o reemplaza el usuario devuelto por la API sin recargar la lista. */
  protected onGuardado(guardado: User): void {
    const existe = this.usuarios().some((u) => u.id === guardado.id);
    this.guardarEnLista(guardado);
    this.aviso.set(existe ? `Usuario «${guardado.nombre}» actualizado.` : `Usuario «${guardado.nombre}» creado.`);
  }

  protected onRolCambiado(usuario: User): void {
    this.guardarEnLista(usuario);
    this.aviso.set(`«${usuario.nombre}» ahora tiene el rol ${ETIQUETAS_ROL[usuario.rol]}.`);
  }

  private guardarEnLista(guardado: User): void {
    this.usuarios.update((lista) =>
      lista.some((u) => u.id === guardado.id)
        ? lista.map((u) => (u.id === guardado.id ? guardado : u))
        : [...lista, guardado],
    );
  }

  protected onBusqueda(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
  }

  protected onFiltroRol(event: Event): void {
    this.filtroRol.set((event.target as HTMLSelectElement).value as FiltroRol);
  }

  protected onFiltroEstado(event: Event): void {
    this.filtroEstado.set((event.target as HTMLSelectElement).value as FiltroEstado);
  }
}
