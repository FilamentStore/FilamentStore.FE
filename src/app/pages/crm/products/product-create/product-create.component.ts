import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDividerModule,
  ],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss',
})
export class ProductCreateComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    sku: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: [''],
    status: ['draft' as 'draft' | 'active', Validators.required],
  });

  categories = ['PLA', 'ABS', 'PETG', 'TPU', 'ASA', 'Nylon', 'Resin', 'Інше'];

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    // TODO: підключити API створення продукту
    console.log('Create product:', this.form.value);
    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/crm/products']);
    }, 800);
  }

  onCancel(): void {
    this.router.navigate(['/crm/products']);
  }
}
