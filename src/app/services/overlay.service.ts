import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {
  private refreshTokenverlayVisibleSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public RefreshTokenverlayVisible$: Observable<boolean> = this.refreshTokenverlayVisibleSubject.asObservable();

  constructor() { }

  showRefreshTokenOverlay() {
    this.refreshTokenverlayVisibleSubject.next(true);
  }

  hideRefreshTokenOverlay() {
    this.refreshTokenverlayVisibleSubject.next(false);
  }
}
