import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@components/_layout/header/header.component';
import { FooterComponent } from '@components/_layout/footer/footer.component';
import { CategoryNavComponent } from '@components/_layout/category-nav/category-nav.component';

@Component({
  selector: 'app-site-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    CategoryNavComponent,
  ],
  templateUrl: './site-shell.component.html',
  styleUrl: './site-shell.component.scss',
})
export class SiteShellComponent {}
