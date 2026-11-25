import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

void defineCustomElements(window);

bootstrapApplication(AppComponent, appConfig).catch((error: unknown) => console.error(error));
