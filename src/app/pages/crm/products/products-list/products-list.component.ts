import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
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
import { finalize } from 'rxjs/operators';
import { ROUTES } from '@constants/app.routes.const';
import {
  Product,
  ProductFilters,
  ProductsPagination,
  WcCategory,
} from '@app/models/product.models';
import { ProductsService } from '@app/services/tempService/products.service';

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
  private router = inject(Router);
  private productsService = inject(ProductsService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(false);
  readonly categories = signal<WcCategory[]>([]);
  readonly pagination = signal<ProductsPagination>({
    total: 0,
    totalPages: 0,
  });
  readonly filters = signal<ProductFilters>({
    search: '',
    status: '',
    category_id: null,
    page: 1,
  });

  readonly confirmDeleteId = signal<number | null>(null);

  readonly displayedColumns = [
    'image',
    'name',
    'brand',
    'variations',
    'status',
    'actions',
  ];

  readonly filterForm = new FormGroup({
    search: new FormControl(''),
    status: new FormControl(''),
    category_id: new FormControl<number | null>(null),
  });

  readonly statusOptions = [
    { value: '', label: 'Всі статуси' },
    { value: 'publish', label: 'Активні' },
    { value: 'draft', label: 'Чернетки' },
    { value: 'private', label: 'Приховані' },
  ];

  ngOnInit(): void {
    this.loadCategories();
    this.syncFormWithFilters();
    this.loadProducts();
  }

  applyFilters(): void {
    const { search, status, category_id } = this.filterForm.getRawValue();

    this.filters.set({
      search: search ?? '',
      status: status ?? '',
      category_id: category_id ?? null,
      page: 1,
    });

    this.loadProducts();
  }

  resetFilters(): void {
    this.filterForm.reset({ search: '', status: '', category_id: null });
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.filters.update(filters => ({
      ...filters,
      page: event.pageIndex + 1,
    }));

    this.loadProducts();
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

    if (id === null) {
      return;
    }

    this.loading.set(true);
    this.productsService
      .deleteProduct(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.confirmDeleteId.set(null);

          const currentFilters = this.filters();
          const currentProducts = this.products();

          if (currentProducts.length === 1 && currentFilters.page > 1) {
            this.filters.update(filters => ({
              ...filters,
              page: filters.page - 1,
            }));
          }

          this.loadProducts();
        },
      });
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

  private syncFormWithFilters(): void {
    const filters = this.filters();

    this.filterForm.patchValue(
      {
        search: filters.search,
        status: filters.status,
        category_id: filters.category_id,
      },
      { emitEvent: false },
    );
  }

  private loadProducts(): void {
    this.loading.set(true);

    this.productsService
      .getProducts(this.filters())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => {
          this.products.set(response.products);
          this.pagination.set({
            total: response.total,
            totalPages: response.total_pages,
          });
        },
        error: () => {
          this.products.set([]);
          this.pagination.set({ total: 0, totalPages: 0 });
        },
      });
  }

  private loadCategories(): void {
    this.productsService.getCategories().subscribe({
      next: categories => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
  }
}
