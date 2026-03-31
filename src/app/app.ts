import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AttributesActions } from '@store/attributes/attributes.actions';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  constructor() {
    inject(Store).dispatch(AttributesActions.loadAttributes());
  }
}
