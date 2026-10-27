import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { ProfileTheme, ProfileThemeClasses, profileTheme } from './profile-theme';

/** Marketing strip for the public profiles: three steps from "interested" to "training". */
@Component({
  selector: 'app-how-it-works',
  imports: [CommonModule, IconsModule],
  template: `
    <section class="font-sans {{ t.card }}">
      <div class="flex flex-col gap-1 mb-6 text-center sm:text-left">
        <span class="text-[11px] uppercase tracking-wide {{ t.eyebrow }} font-semibold">Simple from the start</span>
        <h2 class="text-xl font-extrabold {{ t.heading }} leading-tight">How it <span class="{{ t.accent }}">works</span></h2>
      </div>
      <ol class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <li *ngFor="let s of steps; let i = index" class="flex sm:flex-col gap-4 sm:gap-3">
          <span class="shrink-0 w-10 h-10 rounded-full bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-400">
            <i-feather [name]="s.icon" style="width:17px;height:17px;"></i-feather>
          </span>
          <div class="flex flex-col gap-1">
            <h3 class="text-sm font-bold {{ t.heading }}"><span class="{{ t.accent }}">{{ i + 1 }}.</span> {{ s.title }}</h3>
            <p class="text-xs {{ t.muted }} leading-relaxed">{{ s.text }}</p>
          </div>
        </li>
      </ol>
    </section>
  `
})
export class HowItWorksComponent {
  /** Lower-case noun phrase: "this trainer" / "this center". */
  @Input() providerLabel = 'the provider';
  /** 'dark' on the public profile, 'light' on the signed-in dashboard. */
  @Input() theme: ProfileTheme = 'dark';

  get t(): ProfileThemeClasses { return profileTheme(this.theme); }

  get steps(): { icon: string; title: string; text: string }[] {
    const who = this.providerLabel.charAt(0).toUpperCase() + this.providerLabel.slice(1);
    return [
      { icon: 'calendar', title: 'Pick a time', text: `Choose a date and time that suits you from ${this.providerLabel}'s open hours.` },
      { icon: 'check-circle', title: 'Get confirmed', text: `${who} accepts your request. Nothing is charged before that.` },
      { icon: 'zap', title: 'Pay & train', text: 'Pay securely by card within 24 hours, then show up. Free cancellation applies before the cutoff.' },
    ];
  }
}
