import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PhotoLightboxService } from 'src/app/services/photo-lightbox.service';

/**
 * Single app-wide "click a photo, see it full-size" overlay. Mounted once in
 * app.component.html so every page can pop a photo open just by calling
 * `PhotoLightboxService.open(src)` on click -- no per-page overlay markup.
 */
@Component({
  selector: 'app-photo-lightbox',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div *ngIf="src$ | async as src" (click)="lightbox.close()"
        class="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4">

        <button type="button" (click)="lightbox.close()"
            class="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition">
            <i-feather name="x" style="width:18px;height:18px;"></i-feather>
        </button>

        <img [src]="src" alt="" class="max-w-full max-h-[85vh] object-contain rounded-lg" (click)="$event.stopPropagation()" />
    </div>
  `
})
export class PhotoLightboxComponent {
  src$: Observable<string | null> = this.lightbox.src$;

  constructor(public lightbox: PhotoLightboxService) {}
}
