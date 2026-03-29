import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ConfigActions } from './config.actions';
import { ConfigService } from '@app/services/tempService/config.service';

@Injectable()
export class ConfigEffects {
  private actions$ = inject(Actions);
  private svc = inject(ConfigService);

  loadConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.loadConfig),
      switchMap(() =>
        this.svc.loadConfig().pipe(
          map(data => ConfigActions.loadConfigSuccess(data)),
          catchError((err: { message: string }) =>
            of(ConfigActions.loadConfigFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  addColor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.addColor),
      switchMap(({ color }) =>
        this.svc.saveConfig().pipe(
          map(() => ConfigActions.addColorSuccess({ color })),
          catchError((err: { message: string }) =>
            of(ConfigActions.addColorFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  updateColor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.updateColor),
      switchMap(({ oldSlug, color }) =>
        this.svc.saveConfig().pipe(
          map(() => ConfigActions.updateColorSuccess({ oldSlug, color })),
          catchError((err: { message: string }) =>
            of(ConfigActions.updateColorFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  removeColor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.removeColor),
      switchMap(({ slug }) =>
        this.svc.saveConfig().pipe(
          map(() => ConfigActions.removeColorSuccess({ slug })),
          catchError((err: { message: string }) =>
            of(ConfigActions.removeColorFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  addValue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.addValue),
      switchMap(({ key, option }) =>
        this.svc.saveConfig().pipe(
          map(() => ConfigActions.addValueSuccess({ key, option })),
          catchError((err: { message: string }) =>
            of(ConfigActions.addValueFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  updateValue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.updateValue),
      switchMap(({ key, oldSlug, option }) =>
        this.svc.saveConfig().pipe(
          map(() => ConfigActions.updateValueSuccess({ key, oldSlug, option })),
          catchError((err: { message: string }) =>
            of(ConfigActions.updateValueFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  removeValue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.removeValue),
      switchMap(({ key, slug }) =>
        this.svc.saveConfig().pipe(
          map(() => ConfigActions.removeValueSuccess({ key, slug })),
          catchError((err: { message: string }) =>
            of(ConfigActions.removeValueFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.loadCategories),
      switchMap(() =>
        this.svc.getCategories().pipe(
          map(categories =>
            ConfigActions.loadCategoriesSuccess({ categories }),
          ),
          catchError((err: { message: string }) =>
            of(ConfigActions.loadCategoriesFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  createCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.createCategory),
      switchMap(({ name, slug }) =>
        this.svc.createCategory(name, slug).pipe(
          map(category => ConfigActions.createCategorySuccess({ category })),
          catchError((err: { message: string }) =>
            of(ConfigActions.createCategoryFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  updateCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.updateCategory),
      switchMap(({ id, name, slug }) =>
        this.svc.updateCategory(id, name, slug).pipe(
          map(category => ConfigActions.updateCategorySuccess({ category })),
          catchError((err: { message: string }) =>
            of(ConfigActions.updateCategoryFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  deleteCategory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.deleteCategory),
      switchMap(({ id }) =>
        this.svc.deleteCategory(id).pipe(
          map(() => ConfigActions.deleteCategorySuccess({ id })),
          catchError((err: { message: string }) =>
            of(ConfigActions.deleteCategoryFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );
}
