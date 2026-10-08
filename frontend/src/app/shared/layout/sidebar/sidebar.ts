import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/user.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: Role[];
}

@Component({
  imports: [RouterLink, RouterLinkActive, NgOptimizedImage],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly authService = inject(AuthService);

  private readonly allNavItems = signal<NavItem[]>([
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Terceros', route: '/terceros', icon: 'users' },
    { label: 'Catálogo e Inventario', route: '/catalogo', icon: 'box' },
    { label: 'Ventas', route: '/ventas', icon: 'shopping-cart' },
    { label: 'Compras', route: '/compras', icon: 'truck' },
    { label: 'Configuración', route: '/configuracion', icon: 'settings', roles: ['ADMIN'] },
  ]);

  protected readonly visibleNavItems = computed(() => {
    const role = this.authService.userRole();
    if (!role) {
      return [];
    }

    return this.allNavItems().filter((item) => {
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      return item.roles.includes(role);
    });
  });
}
