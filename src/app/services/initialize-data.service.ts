import { Injectable } from '@angular/core';
import { SharedDataService } from './shared-data.service';

@Injectable({
  providedIn: 'root'
})
export class InitializeDataService {
  private initialized = false;

  constructor(private sharedDataService: SharedDataService) { }

  initializeApp(): Promise<any> {
    if (!this.initialized) {
      return this.sharedDataService.getCategoryData().toPromise().then((data: any) => {
        // Store data in the service
        this.sharedDataService.setCategoryData(data);
        this.initialized = true;
      });
    }
    return Promise.resolve();
  }
}

