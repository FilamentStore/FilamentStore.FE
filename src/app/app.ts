import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AttributesActions } from '@store/attributes/attributes.actions';
import { ConfigActions } from '@store/config/config.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  constructor() {
    const store = inject(Store);

    store.dispatch(AttributesActions.loadAttributes());
    store.dispatch(ConfigActions.load());
  }
}
