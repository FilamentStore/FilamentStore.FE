import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductsActions } from './products.actions';
import { ROUTES } from '@constants/app.routes.const';
import { ProductsService } from '@app/services/tempService/products.service';
import { VariationsService } from '@app/services/tempService/variations.service';

@Injectable()
export class ProductsEffects {
  private actions$ = inject(Actions);
  private productsService = inject(ProductsService);
  private variationsService = inject(VariationsService);
  private router = inject(Router);

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProducts),
      switchMap(({ search, status, category_id, page }) =>
        this.productsService
          .getProducts({ search, status, category_id, page })
          .pipe(
            map(response => ProductsActions.loadProductsSuccess({ response })),
            catchError((err: { message: string }) =>
              of(ProductsActions.loadProductsFailure({ error: err.message })),
            ),
          ),
      ),
    ),
  );

  loadProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadProduct),
      switchMap(({ id }) =>
        this.productsService.getProduct(id).pipe(
          map(product => ProductsActions.loadProductSuccess({ product })),
          catchError((err: { message: string }) =>
            of(ProductsActions.loadProductFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.createProduct),
      switchMap(({ product }) =>
        this.productsService.createProduct(product).pipe(
          map(created =>
            ProductsActions.createProductSuccess({ product: created }),
          ),
          catchError((err: { message: string }) =>
            of(ProductsActions.createProductFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  createProductSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProductsActions.createProductSuccess),
        tap(({ product }) => {
          this.router.navigate([
            `/${ROUTES.crm.root}/${ROUTES.crm.products.root}/${product.id}`,
          ]);
        }),
      ),
    { dispatch: false },
  );

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.updateProduct),
      switchMap(({ id, product }) =>
        this.productsService.updateProduct(id, product).pipe(
          map(updated =>
            ProductsActions.updateProductSuccess({ product: updated }),
          ),
          catchError((err: { message: string }) =>
            of(ProductsActions.updateProductFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.deleteProduct),
      switchMap(({ id }) =>
        this.productsService.deleteProduct(id).pipe(
          map(() => ProductsActions.deleteProductSuccess({ id })),
          catchError((err: { message: string }) =>
            of(ProductsActions.deleteProductFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  loadVariations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadVariations),
      switchMap(({ productId }) =>
        this.variationsService.getVariations(productId).pipe(
          map(variations =>
            ProductsActions.loadVariationsSuccess({ variations }),
          ),
          catchError((err: { message: string }) =>
            of(ProductsActions.loadVariationsFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  createVariation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.createVariation),
      switchMap(({ productId, variation }) =>
        this.variationsService.createVariation(productId, variation).pipe(
          map(created =>
            ProductsActions.createVariationSuccess({ variation: created }),
          ),
          catchError((err: { message: string }) =>
            of(ProductsActions.createVariationFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );

  updateVariation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.updateVariation),
      switchMap(({ productId, variationId, variation }) =>
        this.variationsService
          .updateVariation(productId, variationId, variation)
          .pipe(
            map(updated =>
              ProductsActions.updateVariationSuccess({ variation: updated }),
            ),
            catchError((err: { message: string }) =>
              of(
                ProductsActions.updateVariationFailure({ error: err.message }),
              ),
            ),
          ),
      ),
    ),
  );

  loadCategories$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductsActions.loadCategories),
      switchMap(() =>
        this.productsService.getCategories().pipe(
          map(categories =>
            ProductsActions.loadCategoriesSuccess({ categories }),
          ),
          catchError((err: { message: string }) =>
            of(ProductsActions.loadCategoriesFailure({ error: err.message })),
          ),
        ),
      ),
    ),
  );
}
