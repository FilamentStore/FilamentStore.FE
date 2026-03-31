import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { authInterceptor } from './helper/interceptors/auth.interceptor';
import { authReducer } from '@store/auth/auth.reducer';
import { attributesReducer } from '@store/attributes/attributes.reducer';
import { AttributesEffects } from '@store/attributes/attributes.effects';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({ auth: authReducer, attributes: attributesReducer }),
    provideEffects(AttributesEffects),
  ],
};
