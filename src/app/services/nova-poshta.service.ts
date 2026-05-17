import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface NpCity {
  Ref: string;
  Present: string;
  MainDescription: string;
  AreaDescription: string;
  SettlementTypeDescription: string;
}

export interface NpWarehouse {
  Ref: string;
  Description: string;
  Number: string;
  CityRef: string;
  TypeOfWarehouse: string;
  Latitude: string;
  Longitude: string;
}

const NP_API = 'https://api.novaposhta.ua/v2.0/json/';
const NP_KEY = '';

@Injectable({ providedIn: 'root' })
export class NovaPoshtaService {
  private readonly http = inject(HttpClient);

  readonly hasApiKey = NP_KEY.length > 0;

  searchCities(query: string): Observable<NpCity[]> {
    return this.http
      .post<{ data: [{ Addresses: NpCity[] }] }>(NP_API, {
        apiKey: NP_KEY,
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: { CityName: query, Limit: '20', Page: '1' },
      })
      .pipe(
        map(res => res.data?.[0]?.Addresses ?? []),
        catchError(() => of([] as NpCity[])),
      );
  }

  searchWarehouses(cityRef: string, search = ''): Observable<NpWarehouse[]> {
    return this.http
      .post<{ data: NpWarehouse[] }>(NP_API, {
        apiKey: NP_KEY,
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties: {
          SettlementRef: cityRef,
          FindByString: search,
          Limit: '500',
        },
      })
      .pipe(
        map(res => res.data ?? []),
        catchError(() => of([] as NpWarehouse[])),
      );
  }
}
