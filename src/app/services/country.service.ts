import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  constructor(private http: HttpClient) { }

  getCountriesData() {
    const apiUrl = 'https://restcountries.com/v3.1/all';
    return this.http.get(apiUrl);
  }
}
