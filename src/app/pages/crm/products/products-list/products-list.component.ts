import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { ROUTES } from '@constants/app.routes.const';
import {
  selectCategories,
  selectFilters,
  selectLoading,
  selectPagination,
  selectProducts,
} from '@store/products/products.selectors';
import { ProductsActions } from '@store/products/products.actions';
import { Product, WcCategory } from '@app/models/product.models';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatBadgeModule,
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);

  products = this.store.selectSignal(selectProducts);
  loading = this.store.selectSignal(selectLoading);
  pagination = this.store.selectSignal(selectPagination);
  filters = this.store.selectSignal(selectFilters);
  categories = this.store.selectSignal(selectCategories);

  confirmDeleteId = signal<number | null>(null);

  displayedColumns = [
    'image',
    'name',
    'brand',
    'variations',
    'status',
    'actions',
  ];

  filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl(''),
    category_id: new FormControl<number | null>(null),
  });

  statusOptions = [
    { value: '', label: 'Всі статуси' },
    { value: 'publish', label: 'Активні' },
    { value: 'draft', label: 'Чернетки' },
    { value: 'private', label: 'Приховані' },
  ];

  ngOnInit(): void {
    this.store.dispatch(ProductsActions.loadCategories());
    this.store.dispatch(ProductsActions.loadProducts({}));
  }

  applyFilters(): void {
    const { search, status, category_id } = this.filterForm.value;
    const f = {
      search: search ?? '',
      status: status ?? '',
      category_id: category_id ?? null,
      page: 1,
    };

    this.store.dispatch(ProductsActions.setFilters(f));
    this.store.dispatch(ProductsActions.loadProducts(f));
  }

  resetFilters(): void {
    this.filterForm.reset({ search: '', status: '', category_id: null });
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    const f = { ...this.filters(), page: event.pageIndex + 1 };

    this.store.dispatch(ProductsActions.setFilters(f));
    this.store.dispatch(ProductsActions.loadProducts(f));
  }

  editProduct(id: number): void {
    this.router.navigate([
      `/${ROUTES.crm.root}/${ROUTES.crm.products.root}/${id}`,
    ]);
  }

  createProduct(): void {
    this.router.navigate([
      `/${ROUTES.crm.root}/${ROUTES.crm.products.root}/${ROUTES.crm.products.create}`,
    ]);
  }

  onDeleteClick(id: number): void {
    this.confirmDeleteId.set(id);
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId();

    if (id !== null) {
      this.store.dispatch(ProductsActions.deleteProduct({ id }));
      this.confirmDeleteId.set(null);
    }
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  getStatusLabel(product: Product): string {
    const map: Record<string, string> = {
      publish: 'Активний',
      draft: 'Чернетка',
      private: 'Прихований',
    };

    return map[product.status] ?? product.status;
  }

  getCategoryName(categoryId: number, cats: WcCategory[]): string {
    return cats.find(c => c.id === categoryId)?.name ?? '—';
  }

  hasLowStock(product: Product): boolean {
    return (product.low_stock_count ?? 0) > 0;
  }
}
