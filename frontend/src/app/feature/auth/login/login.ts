import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService} from '../../../core/services/auth.service';
import { LoginCredentials} from '../../../core/models/user.model';
import {HttpErrorResponse} from '@angular/common/http';


@Component({
  imports: [NgOptimizedImage],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor, rellena todos los campos.');
      return;
    }
    const credentials: LoginCredentials = {
      email: this.email(),
      password: this.password(),
    };
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authService.login(credentials).subscribe({
      next: () => {
        void this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.errorMessage.set('Credenciales incorrectas.');
        } else if (err.status === 403) {
          this.errorMessage.set('Tu cuenta está desactivada. Contacta con el administrador.');
        } else {
          this.errorMessage.set('Error al conectar con el servidor. Inténtalo de nuevo.');
        }
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

}
