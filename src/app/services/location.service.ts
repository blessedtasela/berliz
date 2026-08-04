import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, EMPTY } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { Country } from '../models/Location.interface';

@Injectable({ providedIn: 'root' })
export class LocationService {
  private countriesCache$!: Observable<Country[]>;
  private readonly base = 'https://countriesnow.space/api/v0.1';

  constructor(private http: HttpClient) { }

  get countries$(): Observable<Country[]> {
    if (!this.countriesCache$) {
      const url = 'https://restcountries.com/v3.1/all?fields=name,cca2,idd,flags';
      this.countriesCache$ = this.http.get<any[]>(url).pipe(
        map(res =>
          res
            .map(c => {
              // Compose dial code correctly with only one plus sign, and no suffixes
              let dial = '';

              if (c.idd?.root) {
                dial = c.idd.root; // e.g., "+1", "+44"
                if (c.idd.suffixes && c.idd.suffixes.length > 0) {
                  // Append the first suffix if not empty string
                  const suffix = c.idd.suffixes[0];
                  if (suffix && suffix !== '') {
                    dial += suffix; // e.g., "+1242"
                  }
                }
              }

              return {
                id: c.cca2 ?? '',
                name: c.name?.common ?? '',
                code: c.cca2 ?? '',
                iso2: c.cca2 ?? '',
                iso3: '',
                dialCode: dial,   // full dial code like "+1242" or "+234"
                flag: c.flags?.svg ?? '',
                states: []
              } as Country;
            })

            // Optionally filter countries without dialCode or flags
            .filter(c => c.name && c.phoneCode && c.phoneCode && c.emoji)
            .sort((a, b) => a.name.localeCompare(b.name))
        ),
        shareReplay(1),
        catchError(() => {
          // fallback to empty list on error
          return of([]);
        })
      );
    }
    return this.countriesCache$;
  }

  getStates(country: string): Observable<string[]> {
    if (!country) return of([]);
    return this.http.post<any>(`${this.base}/countries/states`, { country }).pipe(
      map(res => res.data?.states?.map((s: any) => s.name) ?? []),
      catchError(() => of([]))
    );
  }

  getCities(country: string, state: string): Observable<string[]> {
    if (!country || !state) return of([]);
    return this.http.post<any>(`${this.base}/countries/state/cities`, { country, state }).pipe(
      map(res => res.data ?? []),
      catchError(() => of([]))
    );
  }
}
