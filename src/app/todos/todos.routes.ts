import type { Routes } from '@angular/router';

export const TODOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/todo-list/todo-list.page').then((m) => m.TodoListPage),
  },
  {
    path: 'new',
    loadComponent: () => import('./pages/todo-form/todo-form.page').then((m) => m.TodoFormPage),
  },
];
