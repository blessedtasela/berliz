import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * Placeholder cards shown while a public list (trainers, centers, disciplines, equipment, exercises) loads.
 *
 * The statically prerendered copy of these pages is also what a crawler or a no-JavaScript reader sees, and it used to be
 * baked with the *empty* state ("Equipment listings coming soon", "More trainers coming soon") even though the live page
 * fills in once its data arrives. An empty state is only true once the first load has finished; until then, this.
 */
@Component({
  selector: 'app-list-skeleton',
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8" role="status" aria-live="polite" aria-label="Loading">
      <div *ngFor="let _ of slots" class="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-4 animate-pulse">
        <div class="h-32 rounded-xl bg-zinc-800"></div>
        <div class="h-3 w-2/3 rounded bg-zinc-800"></div>
        <div class="h-3 w-1/3 rounded bg-zinc-800"></div>
      </div>
      <span class="sr-only">Loading…</span>
    </div>
  `,
})
export class ListSkeletonComponent {
  @Input() count = 6;

  get slots(): number[] {
    return Array.from({ length: Math.max(1, this.count) }, (_, i) => i);
  }
}
