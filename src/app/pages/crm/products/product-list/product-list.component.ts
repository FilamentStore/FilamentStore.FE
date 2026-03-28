import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: 'active' | 'draft';
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent {
  displayedColumns = ['name', 'sku', 'price', 'stock', 'status', 'actions'];

  // TODO: замінити на дані з API
  products: Product[] = [];
}
