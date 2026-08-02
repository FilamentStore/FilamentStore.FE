import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@app/services/auth/auth.service';
import { ROUTES } from '@app/constants/app.routes.const';

const ERROR_MESSAGES: Record<string, string> = {
  bad_request: 'Перевірте правильність заповнення полів',
  email_exists: 'Цей email вже зареєстрований',
  server_error: 'Помилка сервера, спробуйте пізніше',
};

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  readonly loginPath = `/${ROUTES.crm.root}/${ROUTES.crm.auth.root}/${ROUTES.crm.auth.login}`;

  hidePassword = signal(true);
  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  togglePasswordVisibility(event: MouseEvent): void {
    this.hidePassword.update(v => !v);
    event.stopPropagation();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: res => {
        if (!res.token) {
          this.router.navigate([
            `/${ROUTES.crm.root}/${ROUTES.crm.auth.root}/${ROUTES.crm.auth.login}`,
          ]);

          return;
        }

        this.router.navigate([
          res.user.isAdmin
            ? `/${ROUTES.crm.root}/${ROUTES.crm.dashboard}`
            : `/${ROUTES.site.account}`,
        ]);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          ERROR_MESSAGES[err.error?.code] ?? 'Не вдалося зареєструватись',
        );
        this.loading.set(false);
      },
    });
  }
}
