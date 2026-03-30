import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AttributesStore } from '@store/attributes/attributes.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  constructor() {
    inject(AttributesStore).init();
  }
}
