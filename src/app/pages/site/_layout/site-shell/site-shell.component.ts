import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../../../components/_layout/header/header.component';
import { FooterComponent } from '../../../../components/_layout/footer/footer.component';

@Component({
  selector: 'app-site-shell',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './site-shell.component.html',
  styleUrl: './site-shell.component.scss',
})
export class SiteShellComponent {}
