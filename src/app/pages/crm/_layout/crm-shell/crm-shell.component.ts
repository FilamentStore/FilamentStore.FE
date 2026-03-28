import { Component, inject, signal } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { ROUTES } from '../../../../app.routes.const';

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
  private auth = inject(AuthService);
  private router = inject(Router);

  sidenavOpen = signal(true);
  currentUser = this.auth.currentUser;

  navItems: NavItem[] = [
    {
      label: 'Дашборд',
      icon: 'dashboard',
      route: `/${ROUTES.crm.root}/${ROUTES.crm.dashboard}`,
    },
    {
      label: 'Продукти',
      icon: 'inventory_2',
      route: `/${ROUTES.crm.root}/${ROUTES.crm.products.root}`,
    },
  ];

  toggleSidenav(): void {
    this.sidenavOpen.update(v => !v);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate([
      `/${ROUTES.crm.root}/${ROUTES.crm.auth.root}/${ROUTES.crm.auth.login}`,
    ]);
  }
}
