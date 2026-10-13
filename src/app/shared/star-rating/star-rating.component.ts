import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/** The shape of one 5-point star, drawn inline so partial fills (4.3 of 5) need no icon font. */
const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

/**
 * Star rating, two ways. Display: `<app-star-rating [value]="4.6" [count]="12">` shows 4.6 of 5 stars with the
 * number and review count beside them; with no value yet it says so rather than showing five empty stars as if
 * the provider were rated zero. Input: `<app-star-rating [interactive]="true" [(value)]="rating">` is a
 * five-option radio group (click, or arrow keys once focused) for the review forms.
 */
@Component({
  selector: 'app-star-rating',
  imports: [CommonModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => StarRatingComponent), multi: true }],
  template: `
    <ng-container *ngIf="!interactive">
      <span *ngIf="hasValue; else unrated" class="inline-flex items-center gap-1.5 text-[11px]"
        [attr.aria-label]="ariaLabel" role="img">
        <span class="relative inline-block leading-none" [style.width.px]="size * 5" [style.height.px]="size" aria-hidden="true">
          <span class="absolute inset-0 flex text-gray-300 dark:text-zinc-700">
            <svg *ngFor="let s of stars" [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="currentColor"><path [attr.d]="path"/></svg>
          </span>
          <span class="absolute inset-y-0 left-0 overflow-hidden text-amber-400" [style.width.%]="fillPercent">
            <span class="flex" [style.width.px]="size * 5">
              <svg *ngFor="let s of stars" [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="currentColor"><path [attr.d]="path"/></svg>
            </span>
          </span>
        </span>
        <span class="font-bold" [ngClass]="textClass">{{ value | number:'1.1-1' }}</span>
        <span *ngIf="count !== null" class="opacity-60">({{ count }})</span>
      </span>
      <ng-template #unrated>
        <span *ngIf="showUnrated" class="text-[11px] opacity-60">No ratings yet</span>
      </ng-template>
    </ng-container>

    <div *ngIf="interactive" role="radiogroup" [attr.aria-label]="label" class="inline-flex items-center gap-0.5"
      (keydown)="onKey($event)">
      <button type="button" *ngFor="let s of stars; let i = index" role="radio"
        [disabled]="disabled" [attr.aria-checked]="value === i + 1" [attr.aria-label]="(i + 1) + (i === 0 ? ' star' : ' stars')"
        [attr.tabindex]="value === i + 1 || (!value && i === 0) ? 0 : -1"
        (click)="pick(i + 1)" (mouseenter)="hover = i + 1" (mouseleave)="hover = 0" (focus)="hover = 0"
        class="p-0.5 rounded transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
        <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="currentColor"
          [ngClass]="(hover || value || 0) > i ? 'text-amber-400' : 'text-gray-300 dark:text-zinc-600'"><path [attr.d]="path"/></svg>
      </button>
    </div>
  `
})
export class StarRatingComponent implements ControlValueAccessor {
  /** Average (display) or the chosen rating (interactive); null/0 = none yet. */
  @Input() value: number | null | undefined = null;
  /** How many ratings the average comes from; omit to hide the count. */
  @Input() count: number | null = null;
  @Input() interactive = false;
  @Input() size = 14;
  @Input() label = 'Your rating';
  /** Display mode with no ratings: say "No ratings yet" (true) or render nothing (false). */
  @Input() showUnrated = false;
  /** Text colour of the number beside the stars. */
  @Input() textClass = 'text-gray-900 dark:text-gray-100';
  @Output() valueChange = new EventEmitter<number>();

  readonly stars = [0, 1, 2, 3, 4];
  readonly path = STAR_PATH;
  hover = 0;
  disabled = false;

  private onChange: (v: number) => void = () => { };
  private onTouched: () => void = () => { };

  get hasValue(): boolean {
    return typeof this.value === 'number' && this.value > 0;
  }

  /** Clamped to 0-5 so a bad number from the server cannot overflow the star row. */
  get fillPercent(): number {
    const v = Math.min(5, Math.max(0, this.value ?? 0));
    return (v / 5) * 100;
  }

  get ariaLabel(): string {
    const base = `Rated ${Number(this.value).toFixed(1)} out of 5`;
    if (this.count === null) return base;
    return `${base} from ${this.count} ${this.count === 1 ? 'review' : 'reviews'}`;
  }

  writeValue(v: number | null): void { this.value = v; }
  registerOnChange(fn: (v: number) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  pick(n: number): void {
    if (this.disabled) return;
    this.value = n;
    this.valueChange.emit(n);
    this.onChange(n);
    this.onTouched();
  }

  onKey(event: KeyboardEvent): void {
    const current = this.value ?? 0;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(5, current + 1);
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(1, current - 1);
    if (next === null) return;
    event.preventDefault();
    this.pick(next);
    // keep the roving focus on the star that is now selected
    const group = event.currentTarget as HTMLElement;
    setTimeout(() => (group.querySelectorAll('button')[next! - 1] as HTMLElement | undefined)?.focus());
  }
}
