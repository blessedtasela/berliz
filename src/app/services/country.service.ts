import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  url = environment.api;
  private baseUrl = this.url + '/apis';

  // simple in-memory cache (prevents refetching)
  private countriesCache: any[] | null = null;
  private statesCache = new Map<number, any[]>();
  private citiesCache = new Map<number, any[]>();



  constructor(private http: HttpClient) { }

  getCountriesFromApi() {
    return this.http.get(this.url + '/apis/getCountriesFromApi');
  }

  syncLocationsInDB() {
    return this.http.get(this.url + '/apis/syncLocationsInDB');
  }

  /**
  * GET ALL COUNTRIES
  */
  getCountries(): Observable<any> {
    if (this.countriesCache) {
      return of(this.countriesCache);
    }

    return this.http.get<any>(`${this.baseUrl}/getCountries`)
      .pipe(
        tap(res => this.countriesCache = res)
      );
  }

  /**
   * GET STATES BY COUNTRY ID
   */
  getStates(countryId: number): Observable<any> {
    if (this.statesCache.has(countryId)) {
      return of(this.statesCache.get(countryId)!);
    }

    return this.http.get<any>(
      `${this.baseUrl}/countries/${countryId}/states`
    ).pipe(
      tap(res => this.statesCache.set(countryId, res))
    );
  }

  /**
   * GET CITIES BY STATE ID
   */
  getCities(stateId: number): Observable<any> {
    if (this.citiesCache.has(stateId)) {
      return of(this.citiesCache.get(stateId)!);
    }

    return this.http.get<any>(
      `${this.baseUrl}/states/${stateId}/cities`
    ).pipe(
      tap(res => this.citiesCache.set(stateId, res))
    );
  }
  /**
   * OPTIONAL: clear cache (use after scheduler sync or admin update)
   */
  clearCache() {
    this.countriesCache = null;
    this.statesCache.clear();
    this.citiesCache.clear();
  }

  getCountriesData() {
    return this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=name').pipe(
      catchError(() => {
        // fallback to empty so the form still loads
        return of([]);
      })
    );
  }

}
