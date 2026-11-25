import { provideHttpClient, withFetch } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import {
  PreloadAllModules,
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { AuthService } from './auth/data/auth.service';
import { provideI18n } from './core/i18n/provide-i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideI18n(),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    importProvidersFrom(IonicStorageModule.forRoot()),
    provideAppInitializer(() => inject(AuthService).restoreSession()),
  ],
};
