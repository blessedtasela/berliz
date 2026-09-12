import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Country } from '../models/Location.interface';

export interface LocationOption {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private countriesCache$!: Observable<Country[]>;
  private readonly base = `${environment.api}/apis`;

  constructor(private http: HttpClient) { }

  get countries$(): Observable<Country[]> {
    if (!this.countriesCache$) {
      this.countriesCache$ = this.http.get<any[]>(`${this.base}/getCountries`).pipe(
        map(res =>
          res
            .map(c => ({
              id: c.id,
              name: c.name ?? '',
              code: c.iso2 ?? '',
              iso2: c.iso2 ?? '',
              iso3: c.iso3 ?? '',
              dialCode: c.phonecode ? `+${c.phonecode}` : '',
              emoji: c.emoji ?? '',
              states: []
            } as Country))
            .filter(c => c.name && c.code)
            .sort((a, b) => a.name.localeCompare(b.name))
        ),
        shareReplay(1),
        catchError(() => of([]))
      );
    }
    return this.countriesCache$;
  }

  getStates(countryId: number): Observable<LocationOption[]> {
    if (!countryId) return of([]);
    return this.http.get<any[]>(`${this.base}/countries/${countryId}/states`).pipe(
      map(res => res.map(s => ({ id: s.id, name: s.name }))),
      catchError(() => of([]))
    );
  }

  getCities(stateId: number): Observable<LocationOption[]> {
    if (!stateId) return of([]);
    return this.http.get<any[]>(`${this.base}/states/${stateId}/cities`).pipe(
      map(res => res.map(c => ({ id: c.id, name: c.name }))),
      catchError(() => of([]))
    );
  }
}
