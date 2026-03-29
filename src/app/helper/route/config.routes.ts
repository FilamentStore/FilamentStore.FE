import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { ConfigPageComponent } from '@app/pages/crm/configuration/config-page/config-page.component';
import { configFeature } from '@store/config/config.reducer';
import { ConfigEffects } from '@store/config/config.effects';
import { Routes } from '@angular/router';
import { ROUTES } from '@app/constants/app.routes.const';

const crm = ROUTES.crm;

export const CONFIG_ROUTES: Routes = [
  {
    path: '',
    providers: [provideState(configFeature), provideEffects(ConfigEffects)],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: crm.configuration.attributes,
      },
      {
        path: crm.configuration.attributes,
        loadComponent: () =>
          import('@pages/crm/configuration/attributes-tab/attributes-tab.component').then(
            m => m.AttributesTabComponent,
          ),
      },
      {
        path: crm.configuration.categories,
        component: ConfigPageComponent,
      },
    ],
  },
];
