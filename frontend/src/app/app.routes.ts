import { Routes } from '@angular/router';
import { MainLayout } from './shared/layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./feature/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'terceros',
        loadComponent: () =>
          import('./feature/terceros/terceros').then((m) => m.Terceros),
      },
      {
        path: 'catalogo',
        loadComponent: () =>
          import('./feature/catalogo/catalogo').then((m) => m.Catalogo),
      },
      {
        path: 'ventas',
        loadComponent: () =>
          import('./feature/ventas/ventas').then((m) => m.Ventas),
      },
      {
        path: 'compras',
        loadComponent: () =>
          import('./feature/compras/compras').then((m) => m.Compras),
      },
      {
        path: 'configuracion',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./feature/configuracion/configuracion').then((m) => m.Configuracion),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
