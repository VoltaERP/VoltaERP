import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearUsuarioDto, EditarUsuarioDto, Role, User } from '../models/user.model';

/** Acceso a la API de gestión de usuarios (/api/usuarios). */
@Service()
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/usuarios';

  listar(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL);
  }

  crear(datos: CrearUsuarioDto): Observable<User> {
    return this.http.post<User>(this.API_URL, datos);
  }

  editar(id: number, datos: EditarUsuarioDto): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, datos);
  }

  cambiarRol(id: number, rol: Role): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/rol`, { rol });
  }

  cambiarEstado(id: number, activo: boolean): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/estado`, { activo });
  }
}
