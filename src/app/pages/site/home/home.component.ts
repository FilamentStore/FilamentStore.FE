import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface HeroSlide {
  material: string;
  title: string;
  description: string;
  cta: string;
  ctaLink: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly slides: HeroSlide[] = [
    {
      material: 'PLA',
      title: 'Преміум пластик\nдля 3D друку',
      description:
        'Біорозкладний, простий у друку,\nдоступний у широкій палітрі кольорів',
      cta: 'Переглянути асортимент',
      ctaLink: '/catalog',
    },
    {
      material: 'PETG',
      title: 'Міцний і прозорий\nфіламент',
      description:
        'Стійкий до температур та хімії,\nідеальний для функціональних деталей',
      cta: 'Обрати PETG',
      ctaLink: '/catalog',
    },
    {
      material: 'TPU',
      title: 'Гнучкий\nеластичний матеріал',
      description: 'Ударостійкий і гнучкий,\nідеальний для чохлів та ущільнень',
      cta: 'Обрати TPU',
      ctaLink: '/catalog',
    },
  ];

  activeIndex = signal(0);
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.activeIndex.update(i => (i + 1) % this.slides.length);
    }, 5000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  goTo(index: number): void {
    this.activeIndex.set(index);
  }
}
