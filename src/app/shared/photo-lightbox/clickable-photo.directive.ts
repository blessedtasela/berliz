import { Directive, ElementRef, HostListener } from '@angular/core';
import { PhotoLightboxService } from 'src/app/services/photo-lightbox.service';

/**
 * OPT-IN click-to-zoom. Add `appZoom` to an `<img>` that is genuinely there
 * to be looked at full-size — a profile photo on a profile page, an exercise
 * demo, a gallery shot, a post image:
 *   <img src="..." appZoom>
 *
 * It used to auto-attach to every image in the app (`img:not([noZoom])`),
 * which meant a stray tap on any 24px avatar hijacked the click to open a
 * lightbox — and, worse, an avatar sitting inside a routerLink stopped
 * navigating because this swallowed the click. Zoom is now off by default;
 * only images explicitly marked with `appZoom` open the lightbox. Leftover
 * `noZoom` attributes elsewhere are now harmless no-ops.
 */
@Directive({
  selector: 'img[src][appZoom]',
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
