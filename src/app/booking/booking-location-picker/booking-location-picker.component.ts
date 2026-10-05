import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { Trainers, TrainerLocation } from 'src/app/models/trainers.interface';
import { TrainerService } from 'src/app/services/trainer.service';

/** What a booking request needs to carry; spread straight into the payload. */
export interface BookingLocationSelection {
  trainerLocationId?: number;
  customLocation?: string;
  /** True when "my own location" is picked but nothing is typed yet -- the parent should block submit. */
  incomplete: boolean;
}

/**
 * "Where would you like to train?" for a trainer booking. Shows the trainer's
 * listed locations (each with its optional fee) plus, when the trainer allows
 * it, a "my own location" option with its own optional fee. Picking is
 * optional -- a trainer with no listed locations and custom locations off
 * renders nothing at all, so the booking form is unchanged for them.
 *
 * Pass `trainer` when the caller already has it; otherwise the picker looks
 * it up by `trainerId` from the public trainer list.
 */
@Component({
  selector: 'app-booking-location-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div *ngIf="hasOptions" class="flex flex-col gap-1.5">
      <label class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        Where would you like to train? <span class="normal-case text-gray-300 dark:text-gray-600">(optional)</span>
      </label>

      <div class="flex flex-col gap-1.5">
        <button type="button" *ngFor="let loc of locations" (click)="selectListed(loc)"
          class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-left transition"
          [ngClass]="selectedId === loc.id
            ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-300'">
          <span class="flex items-center gap-2 min-w-0">
            <i-feather name="map-pin" class="shrink-0 text-red-500" style="width:13px;height:13px;"></i-feather>
            <span class="text-xs font-semibold text-gray-800 dark:text-gray-100 break-words">{{ label(loc) }}</span>
          </span>
          <span class="shrink-0 text-[11px] font-semibold"
            [ngClass]="loc.fee ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'">
            {{ loc.fee ? '+$' + (loc.fee | number:'1.2-2') : 'No extra fee' }}
          </span>
        </button>

        <button type="button" *ngIf="customAllowed" (click)="selectCustom()"
          class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-left transition"
          [ngClass]="customSelected
            ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-300'">
          <span class="flex items-center gap-2 min-w-0">
            <i-feather name="navigation" class="shrink-0 text-red-500" style="width:13px;height:13px;"></i-feather>
            <span class="text-xs font-semibold text-gray-800 dark:text-gray-100">Somewhere else — my own location</span>
          </span>
          <span class="shrink-0 text-[11px] font-semibold"
            [ngClass]="customFee ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'">
            {{ customFee ? '+$' + (customFee | number:'1.2-2') : 'No extra fee' }}
          </span>
        </button>
      </div>

      <input *ngIf="customSelected" type="text" [(ngModel)]="customText" [ngModelOptions]="{ standalone: true }" (ngModelChange)="emit()" maxlength="200"
        placeholder="Address or place, e.g. 12 Elm St or my apartment gym"
        class="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800
               text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400
               focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition" />

      <p *ngIf="selectedFee" class="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
        <i-feather name="info" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
        This location adds a &#36;{{ selectedFee | number:'1.2-2' }} fee on top of the session price.
      </p>
    </div>
  `,
})
export class BookingLocationPickerComponent implements OnInit, OnChanges {
  @Input() trainerId: number | null | undefined = null;
  @Input() trainer: Trainers | null | undefined = null;
  /** Restores an earlier choice (e.g. from a saved booking draft) once the trainer's options are known. */
  @Input() preselect: { trainerLocationId?: number | null; customLocation?: string | null } | null | undefined = null;
  @Output() selectionChange = new EventEmitter<BookingLocationSelection>();

  private loadedTrainer: Trainers | null = null;

  locations: TrainerLocation[] = [];
  customAllowed = false;
  customFee: number | null = null;

  selectedId: number | null = null;
  customSelected = false;
  customText = '';

  constructor(private trainerService: TrainerService) {}

  ngOnInit(): void { this.resolve(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trainer'] || changes['trainerId']) this.resolve();
    else if (changes['preselect'] && !changes['preselect'].firstChange) this.apply(this.loadedTrainer, true);
  }

  get hasOptions(): boolean { return this.locations.length > 0 || this.customAllowed; }

  get selectedFee(): number | null {
    if (this.customSelected) return this.customFee || null;
    return this.locations.find(l => l.id === this.selectedId)?.fee || null;
  }

  label(loc: TrainerLocation): string {
    return [loc.venue, loc.city, loc.stateProvince, loc.country].filter(p => !!p && String(p).trim()).join(', ');
  }

  selectListed(loc: TrainerLocation): void {
    // Tapping the selected one again clears it -- the choice is optional.
    this.selectedId = this.selectedId === loc.id ? null : (loc.id ?? null);
    this.customSelected = false;
    this.emit();
  }

  selectCustom(): void {
    this.customSelected = !this.customSelected;
    this.selectedId = null;
    this.emit();
  }

  emit(): void {
    const custom = this.customText.trim();
    this.selectionChange.emit({
      trainerLocationId: this.selectedId ?? undefined,
      customLocation: this.customSelected && custom ? custom : undefined,
      incomplete: this.customSelected && !custom,
    });
  }

  private resolve(): void {
    if (this.trainer) { this.apply(this.trainer); return; }
    if (!this.trainerId) { this.apply(null); return; }

    const id = this.trainerId;
    this.trainerService.getActiveTrainers().pipe(take(1), catchError(() => of(null))).subscribe(res => {
      // Failing to load locations just hides this optional picker; booking still works without it.
      this.apply((res?.data ?? []).find(t => t.id === id) ?? null);
    });
  }

  private apply(trainer: Trainers | null, preselectChanged = false): void {
    this.loadedTrainer = trainer;
    this.locations = trainer?.locations ?? [];
    this.customAllowed = !!trainer?.customLocationAllowed;
    this.customFee = trainer?.customLocationFee ?? null;

    let changed = false;
    const p = this.preselect;
    // Restore only on first load or when the caller hands us a new preselect, never over the user's own pick.
    if (p && (preselectChanged || (this.selectedId == null && !this.customSelected && !this.customText))) {
      if (p.trainerLocationId != null && this.locations.some(l => l.id === p.trainerLocationId)) {
        this.selectedId = p.trainerLocationId;
        this.customSelected = false;
        changed = true;
      } else if (p.customLocation && this.customAllowed) {
        this.customSelected = true;
        this.customText = p.customLocation;
        this.selectedId = null;
        changed = true;
      }
    }

    // A trainer edit between loads can orphan the selection.
    if (this.selectedId != null && !this.locations.some(l => l.id === this.selectedId)) { this.selectedId = null; changed = true; }
    if (!this.customAllowed && this.customSelected) { this.customSelected = false; changed = true; }
    if (changed) this.emit();
  }
}
