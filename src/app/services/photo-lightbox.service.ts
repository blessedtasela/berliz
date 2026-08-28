import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * App-wide "click a photo, see it full-size" state. One `<app-photo-lightbox>`
 * is mounted once at the root (app.component.html) and renders whatever this
 * service holds -- every other component just calls `open(src)` on click
 * instead of owning its own overlay markup/state.
 */
@Injectable({
  providedIn: 'root'
})
export class PhotoLightboxService {
  private readonly srcSubject = new BehaviorSubject<string | null>(null);
  readonly src$ = this.srcSubject.asObservable();

  open(src: string | null | undefined): void {
    if (src) this.srcSubject.next(src);
  }

  close(): void {
    this.srcSubject.next(null);
  }
}
