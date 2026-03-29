import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CategoriesTabComponent } from '../categories-tab/categories-tab.component';
import { AttributesTabComponent } from '../attributes-tab/attributes-tab.component';

@Component({
  selector: 'app-config-page',
  standalone: true,
  imports: [
    MatTabsModule,
    MatIconModule,
    CategoriesTabComponent,
    AttributesTabComponent,
  ],
  templateUrl: './config-page.component.html',
  styleUrl: './config-page.component.scss',
})
export class ConfigPageComponent {}
