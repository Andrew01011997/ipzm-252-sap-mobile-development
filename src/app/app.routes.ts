import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import type { Routes } from '@angular/router';

import { HOME_URL, LOGIN_URL } from './auth/auth-urls';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo([LOGIN_URL]);
const redirectLoggedInToHome = () => redirectLoggedInTo([HOME_URL]);

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((m) => m.AUTH_ROUTES),
    ...canActivate(redirectLoggedInToHome),
  },
  {
    path: 'todos',
    loadChildren: () => import('./todos/todos.routes').then((m) => m.TODOS_ROUTES),
    ...canActivate(redirectUnauthorizedToLogin),
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
