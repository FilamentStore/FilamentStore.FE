import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { CategoriesService } from '@app/services/tempService/categories.service';
import { BrandsService } from '@app/services/tempService/brands.service';
import { ConfigActions } from './config.actions';

@Injectable()
export class ConfigEffects {
  private actions$ = inject(Actions);
  private categoriesService = inject(CategoriesService);
  private brandsService = inject(BrandsService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.load),
      switchMap(() =>
        forkJoin({
          categories: this.categoriesService.getCategories(),
          brands: this.brandsService.getBrands(),
        }).pipe(
          map(({ categories, brands }) =>
            ConfigActions.loadSuccess({ categories, brands }),
          ),
          catchError(err =>
            of(
              ConfigActions.loadFailure({
                error: err?.message ?? 'Помилка завантаження конфігурації',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
