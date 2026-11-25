import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import localeUk from '@angular/common/locales/uk';
import type { ApplicationConfig } from '@angular/core';
import { LOCALE_ID, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
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
import { NetworkStatus } from './core/network/network-status.service';
import { BiometricLock } from './core/security/biometric-lock.service';

registerLocaleData(localeUk);

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
    provideStorage(() => getStorage()),
    { provide: LOCALE_ID, useValue: 'uk' },
    importProvidersFrom(IonicStorageModule.forRoot()),
    provideAppInitializer(() => inject(AuthService).restoreSession()),
    provideAppInitializer(() => inject(BiometricLock).init()),
    provideAppInitializer(() => inject(NetworkStatus).init()),
  ],
};
