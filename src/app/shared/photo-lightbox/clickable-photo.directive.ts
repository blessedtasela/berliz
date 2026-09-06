import { Directive, ElementRef, HostListener } from '@angular/core';
import { PhotoLightboxService } from 'src/app/services/photo-lightbox.service';

/** Interactive ancestors whose own action should win over zoom-the-image. */
const INTERACTIVE_ANCESTOR = 'a[href],a[routerLink],[routerLink],button,[role="button"]';

/**
 * Auto-attaches to every `<img>` in the app (any template whose module/standalone
 * component imports this directive) and makes a *bare* image click-to-zoom via the
 * shared PhotoLightboxService, instead of every page wiring its own click handler.
 *
 * Opt an image out with `noZoom` (tiny decorative icons, file-picker thumbnails):
 *   <img src="..." noZoom>
 *
 * An image inside an interactive ancestor (a link, a routerLink, a button) is left
 * alone -- clicking it runs the ancestor's action (navigate to a profile, open the
 * post sheet, etc.). Pages that specifically want such an image to zoom put an
 * explicit `(click)="lightbox.open(...)"` on the `<img>` itself; that still works.
 */
@Directive({
  selector: 'img[src]:not([noZoom])',
  standalone: true,
})
export class ClickablePhotoDirective {
  constructor(
    private el: ElementRef<HTMLImageElement>,
    private lightbox: PhotoLightboxService,
  ) {
    // Only bare images advertise themselves as zoomable.
    if (!this.el.nativeElement.closest(INTERACTIVE_ANCESTOR)) {
      this.el.nativeElement.classList.add('cursor-zoom-in');
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    // Inside a link / button / routerLink -> that action owns the click.
    if (this.el.nativeElement.closest(INTERACTIVE_ANCESTOR)) return;

    const src = this.el.nativeElement.currentSrc || this.el.nativeElement.src;
    if (!src) return;
    event.stopPropagation();
    event.preventDefault();
    this.lightbox.open(src);
  }
}
