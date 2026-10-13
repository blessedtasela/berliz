import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { DemoRole, DemoService } from 'src/app/services/demo.service';

/**
 * "Explore as a client / trainer / center" -- try a populated app before creating an account. Renders nothing
 * unless the backend has demos switched on. `compact` is a single quiet line for the landing hero; the default
 * is the fuller card used under the login form.
 */
@Component({
  selector: 'app-demo-entry',
  imports: [CommonModule, IconsModule],
  template: `
    <ng-container *ngIf="enabled$ | async">

      <div *ngIf="compact; else card" class="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1 text-xs font-sans"
           [ngClass]="dark ? 'text-zinc-400' : 'text-gray-500 dark:text-gray-400'">
        <span>or look around first:</span>
        <button *ngFor="let r of roles" type="button" (click)="start(r.role)" [disabled]="starting !== null"
                class="font-semibold underline-offset-2 hover:underline transition disabled:opacity-50"
                [ngClass]="dark ? 'text-zinc-200 hover:text-red-400' : 'text-gray-700 dark:text-gray-200 hover:text-red-600'">
          {{ starting === r.role ? 'Opening…' : r.short }}
        </button>
        <span *ngIf="error" class="w-full text-center lg:text-left text-red-500" role="alert">{{ error }}</span>
      </div>

      <ng-template #card>
        <section class="font-sans rounded-2xl border p-4 flex flex-col gap-3"
                 [ngClass]="dark ? 'bg-zinc-900 border-zinc-800' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'">
          <div class="flex flex-col gap-0.5">
            <h3 class="text-sm font-bold" [ngClass]="dark ? 'text-white' : 'text-gray-900 dark:text-gray-100'">Not ready to sign up?</h3>
            <p class="text-[11px]" [ngClass]="dark ? 'text-zinc-500' : 'text-gray-500 dark:text-gray-400'">
              Look around a populated demo. Nothing in it is real and it resets every night.
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button *ngFor="let r of roles" type="button" (click)="start(r.role)" [disabled]="starting !== null"
                    class="px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                    [ngClass]="dark ? 'border-zinc-700 text-zinc-200 hover:border-red-600 hover:text-white' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600'">
              <i-feather [name]="r.icon" style="width:13px;height:13px;"></i-feather>
              {{ starting === r.role ? 'Opening…' : r.label }}
            </button>
          </div>
          <p *ngIf="error" class="text-[11px] text-red-500" role="alert">{{ error }}</p>
        </section>
      </ng-template>

    </ng-container>
  `
})
export class DemoEntryComponent implements OnInit {
  @Input() theme: 'dark' | 'light' = 'light';
  @Input() compact = false;

  enabled$!: Observable<boolean>;
  starting: DemoRole | null = null;
  error = '';

  readonly roles: { role: DemoRole; label: string; short: string; icon: string }[] = [
    { role: 'client', label: 'Explore as a client', short: 'as a client', icon: 'user' },
    { role: 'trainer', label: 'Explore as a trainer', short: 'as a trainer', icon: 'award' },
    { role: 'center', label: 'Explore as a center', short: 'as a center', icon: 'home' },
  ];

  constructor(private demo: DemoService) { }

  get dark(): boolean { return this.theme === 'dark'; }

  ngOnInit(): void {
    this.enabled$ = this.demo.isEnabled();
  }

  start(role: DemoRole): void {
    if (this.starting) return;
    this.starting = role;
    this.error = '';
    this.demo.start(role).subscribe({
      // a full load, not a router navigation: it guarantees a clean app state for the new identity
      next: () => window.location.assign('/dashboard'),
      error: (err: any) => {
        this.starting = null;
        this.error = err?.error?.message || err?.message || 'The demo could not be started. Please try again later.';
      },
    });
  }
}
