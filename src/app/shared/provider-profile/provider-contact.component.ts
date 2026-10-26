import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { ProfileTheme, ProfileThemeClasses, profileTheme } from './profile-theme';

/** `+` and digits only -- what the backend stores (ProviderContactRules.phone) and what tel:/WhatsApp links need. */
export function contactDigits(phone: string | null | undefined): string {
  return (phone ?? '').replace(/[^\d]/g, '');
}

export function telHref(phone: string): string {
  return `tel:${phone.startsWith('+') ? '+' : ''}${contactDigits(phone)}`;
}

/** wa.me wants the number in international format without the +. */
export function whatsappHref(phone: string): string {
  return `https://wa.me/${contactDigits(phone)}`;
}

export function mailHref(email: string): string {
  return `mailto:${email}`;
}

/**
 * "Contact this center": the ways a visitor can reach a provider who has chosen to publish them -- the way
 * forward when online booking isn't open yet. Renders nothing when the provider has published neither.
 */
@Component({
  selector: 'app-provider-contact',
  imports: [CommonModule, IconsModule],
  template: `
    <section *ngIf="hasContact" [ngClass]="compact ? '' : t.card" class="font-sans" aria-label="Contact details">
      <div *ngIf="!compact" class="flex flex-col gap-1 mb-4">
        <span class="text-[11px] uppercase tracking-wide font-semibold" [ngClass]="t.eyebrow">Get in touch</span>
        <h2 class="text-lg font-extrabold leading-tight" [ngClass]="t.heading">Contact <span [ngClass]="t.accent">{{ name }}</span></h2>
      </div>

      <div class="flex flex-col sm:flex-row flex-wrap gap-2">
        <a *ngIf="phone" [href]="call" [ngClass]="t.ghostButton"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 justify-center">
          <i-feather name="phone" style="width:13px;height:13px;"></i-feather>
          Call {{ displayPhone }}
        </a>
        <a *ngIf="phone" [href]="whatsapp" target="_blank" rel="noopener noreferrer" [ngClass]="t.ghostButton"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 justify-center">
          <i-feather name="message-circle" style="width:13px;height:13px;"></i-feather>
          WhatsApp
        </a>
        <a *ngIf="email" [href]="mail" [ngClass]="t.ghostButton"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold transition flex items-center gap-2 justify-center">
          <i-feather name="mail" style="width:13px;height:13px;"></i-feather>
          Email {{ email }}
        </a>
      </div>
    </section>
  `
})
export class ProviderContactComponent {
  @Input() name = 'this provider';
  @Input() phone: string | null | undefined;
  @Input() email: string | null | undefined;
  @Input() theme: ProfileTheme = 'light';
  /** Just the buttons, no card or heading -- for dropping into a notice that already says why. */
  @Input() compact = false;

  get t(): ProfileThemeClasses { return profileTheme(this.theme); }
  get hasContact(): boolean { return !!(this.phone || this.email); }
  get call(): string { return telHref(this.phone!); }
  get whatsapp(): string { return whatsappHref(this.phone!); }
  get mail(): string { return mailHref(this.email!); }
  /** Shown as stored ("+14165550123"); the stored form is what the link uses, so there's no second format to drift. */
  get displayPhone(): string { return this.phone ?? ''; }
}
