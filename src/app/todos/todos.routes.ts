import type { Routes } from '@angular/router';

import { biometricGuard } from '../core/security/biometric.guard';

export const TODOS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [biometricGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/todo-list/todo-list.page').then((m) => m.TodoListPage),
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/todo-form/todo-form.page').then((m) => m.TodoFormPage),
      },
    ],
  },
];
