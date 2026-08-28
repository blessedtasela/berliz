import { Directive, ElementRef, HostListener } from '@angular/core';
import { PhotoLightboxService } from 'src/app/services/photo-lightbox.service';

/**
 * Auto-attaches to every `<img>` in the app (any template whose module/standalone
 * component imports this directive) and makes it click-to-zoom via the shared
 * PhotoLightboxService, instead of every page wiring its own click handler.
 *
 * Opt an image out with `noZoom` (e.g. tiny decorative icons, or an image that's
 * already its own meaningful click target like a file-picker thumbnail):
 *   <img src="..." noZoom>
 *
 * Images that sit inside a routerLink/button (avatar-that-navigates-to-profile,
 * "remove photo" preview, etc.) still zoom on click and stop the click from
 * also triggering the ancestor -- the ancestor action stays one extra click
 * away (click elsewhere on the row/button) rather than being silently lost.
 */
@Directive({
  selector: 'img[src]:not([noZoom])',
  standalone: true,
  host: { class: 'cursor-zoom-in' },
})
export class ClickablePhotoDirective {
  constructor(
    private el: ElementRef<HTMLImageElement>,
    private lightbox: PhotoLightboxService,
  ) {}

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const src = this.el.nativeElement.currentSrc || this.el.nativeElement.src;
    if (!src) return;
    event.stopPropagation();
    event.preventDefault();
    this.lightbox.open(src);
  }
}
