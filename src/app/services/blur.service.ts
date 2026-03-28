import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BlurService {
  private blurState = new BehaviorSubject<boolean>(false);
  blur$ = this.blurState.asObservable();

  enable() { this.blurState.next(true); }
  disable() { this.blurState.next(false); }
}