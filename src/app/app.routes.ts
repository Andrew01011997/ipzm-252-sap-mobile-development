import type { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'todos',
    loadChildren: () => import('./todos/todos.routes').then((m) => m.TODOS_ROUTES),
  },
  {
    path: '',
    redirectTo: 'todos',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'todos',
  },
];
