import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FallbackService {

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  start() {
    this.loadingSubject.next(true);
  }

  done() {
    this.loadingSubject.next(false);
  }
}
