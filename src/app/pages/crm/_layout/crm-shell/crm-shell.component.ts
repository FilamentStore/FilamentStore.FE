import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-crm-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './crm-shell.component.html',
  styleUrl: './crm-shell.component.scss',
})
export class CrmShellComponent {
  sidenavOpen = signal(true);

  navItems: NavItem[] = [
    { label: 'Дашборд', icon: 'dashboard', route: '/crm/dashboard' },
    { label: 'Продукти', icon: 'inventory_2', route: '/crm/products' },
  ];

  toggleSidenav(): void {
    this.sidenavOpen.update(v => !v);
  }
}
