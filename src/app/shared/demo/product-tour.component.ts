import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IconsModule } from 'src/app/icons/icons.module';
import { TourService } from './tour.service';

/** The overlay that shows TourService's current step. Mounted once, app-wide. */
@Component({
  selector: 'app-product-tour',
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div *ngIf="tour.state$ | async as s" class="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4 bg-black/40 font-sans"
         (click)="onBackdrop($event)">
      <div role="dialog" aria-modal="true" aria-labelledby="tour-title"
           class="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-5 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold tracking-wider uppercase text-red-600">Quick tour · {{ s.index + 1 }} of {{ s.steps.length }}</span>
          <button type="button" (click)="tour.close()" aria-label="Close tour"
                  class="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition p-1">
            <i-feather name="x" style="width:14px;height:14px;"></i-feather>
          </button>
        </div>

        <h2 id="tour-title" class="text-base font-extrabold text-gray-900 dark:text-gray-100">{{ s.steps[s.index].title }}</h2>
        <p class="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{{ s.steps[s.index].text }}</p>

        <a *ngIf="s.steps[s.index].link as link" [routerLink]="link" (click)="tour.close()"
           class="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 w-fit">
          {{ s.steps[s.index].linkLabel }}
          <i-feather name="arrow-right" style="width:12px;height:12px;"></i-feather>
        </a>

        <div class="flex items-center justify-between pt-1">
          <div class="flex gap-1.5" aria-hidden="true">
            <span *ngFor="let _ of s.steps; let i = index" class="w-1.5 h-1.5 rounded-full"
                  [ngClass]="i === s.index ? 'bg-red-600' : 'bg-gray-300 dark:bg-gray-700'"></span>
          </div>
          <div class="flex gap-2">
            <button *ngIf="s.index > 0" type="button" (click)="tour.back()"
                    class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">Back</button>
            <button type="button" (click)="tour.next()"
                    class="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition">
              {{ s.index === s.steps.length - 1 ? 'Done' : 'Next' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductTourComponent {

  constructor(public tour: TourService) { }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.tour.close();
  }

  /** A click on the dim area (not the card) closes the tour. */
  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.tour.close();
  }
}
