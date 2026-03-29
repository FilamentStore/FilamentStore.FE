import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';
import { ConfigActions } from './config.actions';
import { ConfigService } from '@app/services/tempService/config.service';
import { selectConfigForSave } from './config.selectors';
import { ColorValue, SimpleAttributeOption } from '@app/models/config.models';

@Injectable()
export class ConfigEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
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

  // ─── Colors ────────────────────────────────────────────────────────

  addColor$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.addColor),
      withLatestFrom(this.store.select(selectConfigForSave)),
      switchMap(([{ color }, config]) =>
        this.svc
          .saveConfig({ ...config, colors: [...config.colors, color] })
          .pipe(
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
      withLatestFrom(this.store.select(selectConfigForSave)),
      switchMap(([{ oldSlug, color }, config]) =>
        this.svc
          .saveConfig({
            ...config,
            colors: config.colors.map((c: ColorValue) =>
              c.slug === oldSlug ? color : c,
            ),
          })
          .pipe(
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
      withLatestFrom(this.store.select(selectConfigForSave)),
      switchMap(([{ slug }, config]) =>
        this.svc
          .saveConfig({
            ...config,
            colors: config.colors.filter((c: ColorValue) => c.slug !== slug),
          })
          .pipe(
            map(() => ConfigActions.removeColorSuccess({ slug })),
            catchError((err: { message: string }) =>
              of(ConfigActions.removeColorFailure({ error: err.message })),
            ),
          ),
      ),
    ),
  );

  // ─── Simple values ─────────────────────────────────────────────────

  addValue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ConfigActions.addValue),
      withLatestFrom(this.store.select(selectConfigForSave)),
      switchMap(([{ key, option }, config]) =>
        this.svc
          .saveConfig({
            ...config,
            simpleAttributes: {
              ...config.simpleAttributes,
              [key]: [...(config.simpleAttributes[key] ?? []), option],
            },
          })
          .pipe(
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
      withLatestFrom(this.store.select(selectConfigForSave)),
      switchMap(([{ key, oldSlug, option }, config]) =>
        this.svc
          .saveConfig({
            ...config,
            simpleAttributes: {
              ...config.simpleAttributes,
              [key]: (config.simpleAttributes[key] ?? []).map(
                (o: SimpleAttributeOption) => (o.slug === oldSlug ? option : o),
              ),
            },
          })
          .pipe(
            map(() =>
              ConfigActions.updateValueSuccess({ key, oldSlug, option }),
            ),
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
      withLatestFrom(this.store.select(selectConfigForSave)),
      switchMap(([{ key, slug }, config]) =>
        this.svc
          .saveConfig({
            ...config,
            simpleAttributes: {
              ...config.simpleAttributes,
              [key]: (config.simpleAttributes[key] ?? []).filter(
                (o: SimpleAttributeOption) => o.slug !== slug,
              ),
            },
          })
          .pipe(
            map(() => ConfigActions.removeValueSuccess({ key, slug })),
            catchError((err: { message: string }) =>
              of(ConfigActions.removeValueFailure({ error: err.message })),
            ),
          ),
      ),
    ),
  );

  // ─── Categories ────────────────────────────────────────────────────

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
