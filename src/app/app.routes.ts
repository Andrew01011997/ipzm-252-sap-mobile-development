import type { Routes } from '@angular/router';

export const routes: Routes = [
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
