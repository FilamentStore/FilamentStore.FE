import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-crm-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './crm-login.component.html',
  styleUrl: './crm-login.component.scss',
})
export class CrmLoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  hidePassword = signal(true);
  loading = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  togglePasswordVisibility(event: MouseEvent): void {
    this.hidePassword.update(v => !v);
    event.stopPropagation();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    // TODO: підключити API авторизації
    setTimeout(() => {
      this.loading.set(false);
      this.router.navigate(['/crm/dashboard']);
    }, 800);
  }
}
