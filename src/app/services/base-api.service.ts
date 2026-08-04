import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseApiService {

  constructor() { }

  protected extractData<T>() {
    return map((res: any) => res.data as T);
  }

  protected extractMessage() {
    return map((res: any) => res.message);
  }
}