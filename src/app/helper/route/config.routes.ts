import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { ConfigPageComponent } from '@pages/crm/tabs/config-page/config-page.component';
import { configFeature } from '@store/config/config.reducer';
import { ConfigEffects } from '@store/config/config.effects';

export const CONFIG_ROUTES: Routes = [
  {
    path: '',
    providers: [provideState(configFeature), provideEffects(ConfigEffects)],
    children: [{ path: '', component: ConfigPageComponent }],
  },
];
