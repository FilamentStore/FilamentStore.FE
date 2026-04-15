import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  stats: StatCard[] = [
    { label: 'Продукти', value: '0', icon: 'inventory_2', color: '#22a794' },
    {
      label: 'Замовлення',
      value: '0',
      icon: 'shopping_cart',
      color: '#5c6bc0',
    },
    { label: 'Клієнти', value: '0', icon: 'group', color: '#ef5350' },
    { label: 'Дохід', value: '₴0', icon: 'payments', color: '#66bb6a' },
  ];
}
