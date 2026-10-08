import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  imports: [],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private readonly authService = inject(AuthService);

  protected readonly userName = computed(
    () => this.authService.currentUser()?.nombre ?? 'Usuario'
  );
  protected readonly userRole = this.authService.userRole;
  protected readonly userInitials = computed(() => {
    const name = this.authService.currentUser()?.nombre ?? 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  logout(): void {
    this.authService.logout();
  }
}
