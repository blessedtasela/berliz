import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IconsModule } from 'src/app/icons/icons.module';

/** Closing call-to-action band at the bottom of a public profile. */
@Component({
  selector: 'app-profile-cta',
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <section class="font-sans relative overflow-hidden rounded-2xl border border-red-900/60 p-6 sm:p-10 text-center"
             style="background: radial-gradient(80% 140% at 50% 0%, rgba(220,38,38,0.28) 0%, rgba(24,24,27,1) 70%);">
      <h2 class="text-2xl sm:text-3xl font-extrabold text-white leading-tight">Ready to start with {{ name }}?</h2>
      <p class="text-sm text-zinc-300 mt-2 max-w-md mx-auto">
        Send a request in under a minute. You're only charged once {{ providerLabel }} confirms.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <button type="button" (click)="book.emit()"
                class="px-8 py-3 rounded-xl bg-red-600 text-white text-sm font-bold shadow-[0_8px_24px_rgba(220,38,38,0.35)]
                       hover:bg-red-700 active:scale-[0.98] transition flex items-center gap-2 justify-center">
          <i-feather name="calendar" style="width:15px;height:15px;"></i-feather>
          Book a session
        </button>
        <a *ngIf="bookLink" [routerLink]="bookLink"
           class="px-6 py-3 rounded-xl border border-zinc-600 text-zinc-100 text-sm font-semibold hover:border-red-500 transition">
          Open the booking page
        </a>
      </div>
    </section>
  `
})
export class ProfileCtaComponent {
  @Input() name = '';
  @Input() providerLabel = 'the provider';
  @Input() bookLink: any[] | null = null;
  @Output() book = new EventEmitter<void>();
}

/**
 * Phone-only booking bar pinned to the bottom of a public profile once the
 * hero's own buttons have scrolled away -- a marketing page shouldn't make a
 * convinced visitor scroll back up to act.
 */
@Component({
  selector: 'app-sticky-book-bar',
  imports: [CommonModule, IconsModule],
  template: `
    <div *ngIf="visible" class="sm:hidden fixed bottom-0 inset-x-0 z-30 font-sans bg-zinc-950/95 backdrop-blur border-t border-zinc-800
                                px-4 py-3 flex items-center gap-3">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold text-white truncate">{{ name }}</p>
        <p class="text-[11px] text-zinc-500 truncate">{{ caption }}</p>
      </div>
      <button type="button" (click)="book.emit()"
              class="shrink-0 px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 active:scale-[0.98] transition">
        Book now
      </button>
    </div>
  `
})
export class StickyBookBarComponent {
  @Input() name = '';
  @Input() caption = 'Free cancellation before the cutoff';
  /** Scroll depth (px) after which the bar appears: past the hero's own Book button on a phone, so two Book buttons are never on screen together. */
  @Input() showAfter = 900;
  @Output() book = new EventEmitter<void>();

  visible = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible = (window.scrollY || 0) > this.showAfter;
  }
}
