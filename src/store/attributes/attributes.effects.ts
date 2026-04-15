import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AttributesService } from '@app/services/tempService/attributes.service';
import { AttributesActions } from './attributes.actions';

@Injectable()
export class AttributesEffects {
  private actions$ = inject(Actions);
  private attributesService = inject(AttributesService);

  loadAttributes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttributesActions.loadAttributes),
      switchMap(() =>
        this.attributesService.loadConfig().pipe(
          map(config => AttributesActions.loadAttributesSuccess({ config })),
          catchError(() => of(AttributesActions.loadAttributesFailure())),
        ),
      ),
    ),
  );
}
