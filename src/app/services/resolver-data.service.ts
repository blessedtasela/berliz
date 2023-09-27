import { Injectable } from '@angular/core';
import { SharedDataService } from './shared-data.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResolverDataService {
  constructor(private sharedDataService: SharedDataService) {}

  resolve(): Observable<any> {
    // Fetch data from your service and return an Observable
    return this.sharedDataService.getCategoryData();
  }

}
