import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private http: HttpClient) { }

  getCountriesData() {
  return this.http.get<any[]>('https://restcountries.com/v3.1/all?fields=name').pipe(
    catchError(() => {
      // fallback to empty so the form still loads
      return of([]);
    })
  );
}
}
