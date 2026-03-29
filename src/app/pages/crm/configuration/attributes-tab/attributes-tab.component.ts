import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

import { ConfigActions } from '@store/config/config.actions';
import { ColorAttributeTabComponent } from './tabs/color-attribute-tab/color-attribute-tab';
import { MaterialAttributeTabComponent } from './tabs/material-attribute-tab/material-attribute-tab';
import { WeightAttributeTabComponent } from './tabs/weight-attribute-tab/weight-attribute-tab';
import { DiameterAttributeTabComponent } from './tabs/diameter-attribute-tab/diameter-attribute-tab';
import { SpoolAttributeTabComponent } from './tabs/spool-attribute-tab/spool-attribute-tab';

@Component({
  selector: 'app-attributes-tab',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatIconModule,
    ColorAttributeTabComponent,
    MaterialAttributeTabComponent,
    WeightAttributeTabComponent,
    DiameterAttributeTabComponent,
    SpoolAttributeTabComponent,
  ],
  templateUrl: './attributes-tab.component.html',
  styleUrl: './attributes-tab.component.scss',
})
export class AttributesTabComponent implements OnInit {
  private readonly store = inject(Store);

  ngOnInit(): void {
    this.store.dispatch(ConfigActions.loadConfig());
  }
}
