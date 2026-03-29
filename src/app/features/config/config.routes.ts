import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { configFeature } from './store/config.reducer';
import { ConfigEffects } from './store/config.effects';
import { ConfigPageComponent } from './components/config-page/config-page.component';

export const CONFIG_ROUTES: Routes = [
  {
    path: '',
    providers: [provideState(configFeature), provideEffects(ConfigEffects)],
    children: [{ path: '', component: ConfigPageComponent }],
  },
];
