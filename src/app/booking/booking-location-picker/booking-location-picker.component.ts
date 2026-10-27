import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { Country } from 'src/app/models/Location.interface';
import { Trainers, TrainerLocation } from 'src/app/models/trainers.interface';
import { LocationService } from 'src/app/services/location.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { SelectComponent } from 'src/app/shared/select/select.component';
import { ClientLocationQuote, groupLocations, normPlace, placeLabel, quoteClientLocation, sameCity, spotHeading } from 'src/app/utils/trainer-location.util';

/** What a booking request needs to carry; spread straight into the payload (see {@link locationPayload}). */
export interface BookingLocationSelection {
  trainerLocationId?: number;
  customLocation?: string;
  /** Where the client's own place is, so the trainer's per-city / outside-the-cities fee applies. */
  customLocationCountry?: string;
  customLocationState?: string;
  customLocationCity?: string;
  /** True when the choice can't be submitted yet (own place picked but unfinished, or somewhere the trainer won't go). */
  incomplete: boolean;
  /** The fee that comes with this choice (null when none), so the booking form can include it in the estimated total. */
  fee: number | null;
  /** A readable name for the choice (a spot's venue or address and city, or the client's own place), for the booking summary. */
  label?: string;
}

/** The location fields of a booking request. Safe to spread whether or not a location was picked. */
export function locationPayload(selection: BookingLocationSelection | null | undefined) {
  if (!selection) return {};
  return {
    trainerLocationId: selection.trainerLocationId,
    customLocation: selection.customLocation,
    customLocationCountry: selection.customLocationCountry,
    customLocationState: selection.customLocationState,
    customLocationCity: selection.customLocationCity,
  };
}

export interface LocationPreselect {
  trainerLocationId?: number | null;
  customLocation?: string | null;
  customLocationCountry?: string | null;
  customLocationState?: string | null;
  customLocationCity?: string | null;
}

interface LocationGroup {
  title: string;
  rows: TrainerLocation[];
}

/**
 * "Where would you like to train?" for a trainer booking. Shows the trainer's
 * listed spots grouped by city (each with its optional fee) plus, when the trainer
 * allows it, "at my own place": the client says which country / state / city and
 * the address, and the fee shown is the one that applies THERE -- a city the trainer
 * lists can cost differently from somewhere outside their cities, or not be offered
 * at all. Picking is optional -- a trainer with no listed locations and own-place
 * off renders nothing, so the booking form is unchanged for them.
 *
 * Pass `trainer` when the caller already has it; otherwise the picker looks
 * it up by `trainerId` from the public trainer list.
 */
@Component({
    selector: 'app-booking-location-picker',
    imports: [CommonModule, FormsModule, IconsModule, SelectComponent],
    template: `
    <div *ngIf="hasOptions" class="flex flex-col gap-2">
      <label class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
        Where would you like to train? <span class="normal-case text-gray-300 dark:text-gray-600">(optional)</span>
      </label>

      <div *ngFor="let group of groups" class="flex flex-col gap-1.5">
        <p *ngIf="groups.length > 1 || customAllowed" class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">{{ group.title }}</p>
        <button type="button" *ngFor="let loc of group.rows" (click)="selectListed(loc)"
          class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-left transition"
          [ngClass]="selectedId === loc.id
            ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-300'">
          <span class="flex items-start gap-2 min-w-0">
            <i-feather name="map-pin" class="shrink-0 text-red-500 mt-0.5" style="width:13px;height:13px;"></i-feather>
            <span class="flex flex-col min-w-0">
              <span class="text-xs font-semibold text-gray-800 dark:text-gray-100 break-words">{{ spotName(loc) }}</span>
              <span *ngIf="spotDetail(loc)" class="text-[11px] text-gray-500 dark:text-gray-400 break-words">{{ spotDetail(loc) }}</span>
            </span>
          </span>
          <span class="shrink-0 text-[11px] font-semibold"
            [ngClass]="loc.fee ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'">
            {{ loc.fee ? '+$' + (loc.fee | number:'1.2-2') : 'No extra trainer fee' }}
          </span>
        </button>
      </div>

      <button type="button" *ngIf="customAllowed" (click)="selectCustom()"
        class="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border text-left transition"
        [ngClass]="customSelected
          ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-300'">
        <span class="flex items-center gap-2 min-w-0">
          <i-feather name="navigation" class="shrink-0 text-red-500" style="width:13px;height:13px;"></i-feather>
          <span class="text-xs font-semibold text-gray-800 dark:text-gray-100">Somewhere else — my own place</span>
        </span>
        <span class="shrink-0 text-[11px] font-semibold"
          [ngClass]="ownPlaceFee ? 'text-amber-700 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'">
          {{ ownPlaceFee ? (placeKnown ? '+$' : 'from +$') + (ownPlaceFee | number:'1.2-2') : 'No extra trainer fee' }}
        </span>
      </button>

      <!-- The client's own place: where it is, so the right fee applies. -->
      <div *ngIf="customSelected" class="flex flex-col gap-2 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
        <div *ngIf="cityShortcuts.length > 0" class="flex flex-wrap items-center gap-1.5">
          <span class="text-[11px] text-gray-400 dark:text-gray-500">In one of their cities?</span>
          <button type="button" *ngFor="let c of cityShortcuts" (click)="useCity(c)"
            class="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:border-red-300 transition">
            {{ c.city }}
          </button>
        </div>

        <app-select [items]="countries" bindLabel="name" bindValue="name" placeholder="Country" ariaLabel="Country of your place"
          [clearable]="false" [ngModel]="place.country" (ngModelChange)="onCountry($event)" [ngModelOptions]="{ standalone: true }"></app-select>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <app-select [items]="states" placeholder="State / province" ariaLabel="State or province of your place" [allowCustom]="true"
            [clearable]="false" [loading]="loading === 'states'" [disabled]="!place.country"
            [ngModel]="place.stateProvince" (ngModelChange)="onState($event)" [ngModelOptions]="{ standalone: true }"></app-select>
          <app-select [items]="cities" placeholder="City" ariaLabel="City of your place" [allowCustom]="true"
            [clearable]="false" [loading]="loading === 'cities'" [disabled]="!place.country"
            [ngModel]="place.city" (ngModelChange)="onCity($event)" [ngModelOptions]="{ standalone: true }"></app-select>
        </div>

        <input type="text" [(ngModel)]="customText" [ngModelOptions]="{ standalone: true }" (ngModelChange)="emit()" maxlength="200"
          aria-label="Address or place" placeholder="Address or place, e.g. 12 Elm St, or the name of your gym"
          class="berliz-input w-full text-sm" />

        <p *ngIf="quote && !quote.ok" class="text-[11px] text-red-600 dark:text-red-400 flex items-start gap-1.5">
          <i-feather name="alert-circle" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
          {{ refusal }}
        </p>
        <p *ngIf="quote && quote.ok && placeKnown" class="text-[11px] text-gray-500 dark:text-gray-400 flex items-start gap-1.5">
          <i-feather name="info" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
          {{ quote.insideListedCity ? 'In ' + place.city + ', where they work.' : 'Outside the cities they list.' }}
          {{ quote.fee ? 'Travel fee: $' + (quote.fee | number:'1.2-2') + '.' : 'No travel fee.' }}
        </p>
      </div>

      <p *ngIf="selectedFee" class="text-[11px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
        <i-feather name="info" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
        This location adds a &#36;{{ selectedFee | number:'1.2-2' }} fee on top of the session price.
      </p>

      <p class="text-[11px] text-gray-400 dark:text-gray-500 flex items-start gap-1.5" data-testid="gym-dropin-note">
        <i-feather name="info" class="shrink-0 mt-0.5" style="width:11px;height:11px;"></i-feather>
        If the gym you pick charges a drop-in fee, you pay that to the gym directly. It is not part of the trainer fee and not paid through Berliz.
      </p>
    </div>
  `
})
export class BookingLocationPickerComponent implements OnInit, OnChanges {
  @Input() trainerId: number | null | undefined = null;
  @Input() trainer: Trainers | null | undefined = null;
  /** Restores an earlier choice (e.g. from a saved booking draft) once the trainer's options are known. */
  @Input() preselect: LocationPreselect | null | undefined = null;
  @Output() selectionChange = new EventEmitter<BookingLocationSelection>();

  private loadedTrainer: Trainers | null = null;

  locations: TrainerLocation[] = [];
  groups: LocationGroup[] = [];
  customAllowed = false;
  customFee: number | null = null;

  selectedId: number | null = null;
  customSelected = false;
  customText = '';
  place = { country: '', stateProvince: '', city: '' };

  countries: Country[] = [];
  states: string[] = [];
  cities: string[] = [];
  loading: 'states' | 'cities' | null = null;
  private stateIds = new Map<string, number>();
  private countriesLoaded = false;

  constructor(private trainerService: TrainerService, private locationService: LocationService) {}

  ngOnInit(): void { this.resolve(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trainer'] || changes['trainerId']) this.resolve();
    else if (changes['preselect'] && !changes['preselect'].firstChange) this.apply(this.loadedTrainer, true);
  }

  get hasOptions(): boolean { return this.locations.length > 0 || this.customAllowed; }

  /** The country and city are both given, so the exact fee for that place is known. */
  get placeKnown(): boolean { return !!normPlace(this.place.country) && !!normPlace(this.place.city); }

  /** What the trainer says about coming to this place (fee, or a refusal); null until there is a trainer. */
  get quote(): ClientLocationQuote | null {
    return this.loadedTrainer ? quoteClientLocation(this.loadedTrainer, this.place) : null;
  }

  /** The fee shown on the "my own place" button: this place's fee once known, else the trainer's usual one. */
  get ownPlaceFee(): number | null {
    const q = this.quote;
    if (this.placeKnown && q?.ok) return q.fee || null;
    return this.customFee || null;
  }

  get selectedFee(): number | null {
    if (this.customSelected) {
      const q = this.quote;
      return q?.ok ? (q.fee || null) : null;
    }
    return this.locations.find(l => l.id === this.selectedId)?.fee || null;
  }

  get refusal(): string {
    const q = this.quote;
    if (!q || q.ok) return '';
    const where = this.place.city || 'there';
    return q.reason === 'CITY_NOT_ALLOWED'
      ? `They don't travel to clients' places in ${where}. Pick one of their spots instead.`
      : q.reason === 'OUTSIDE_NOT_ALLOWED'
        ? 'They only train in the cities they list, so they can\'t come to a place outside them. Pick one of their spots instead.'
        : 'They don\'t train at clients\' own places.';
  }

  /** The trainer's cities that can be used to fill in the client's place in one tap (not the ones switched off). */
  get cityShortcuts(): { country: string; stateProvince: string; city: string }[] {
    return groupLocations(this.locations).filter(a => a.clientAllowed);
  }

  /** The first line of a spot: its name, else the address, else the whole city. */
  spotName(loc: TrainerLocation): string {
    return loc.venue?.trim() || loc.address?.trim() || `Anywhere in ${loc.city}`;
  }

  /** The second line: the address under a named spot, marked when it is only an approximate area. */
  spotDetail(loc: TrainerLocation): string {
    const venue = loc.venue?.trim();
    const address = loc.address?.trim();
    const approximate = loc.locationPrecision === 'AREA';
    if (venue && address) return approximate ? `${address} · approximate area` : address;
    if (address) return approximate ? 'Approximate area' : '';
    return '';
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
    if (this.customSelected) this.ensureCountries();
    this.emit();
  }

  useCity(c: { country: string; stateProvince: string; city: string }): void {
    this.setPlace(c.country, c.stateProvince ?? '', c.city);
    this.emit();
  }

  onCountry(country: string | null): void {
    this.place = { country: country ?? '', stateProvince: '', city: '' };
    this.loadStates(this.place.country, null);
    this.emit();
  }

  onState(state: string | null): void {
    this.place = { ...this.place, stateProvince: state ?? '', city: '' };
    this.loadCities(this.place.stateProvince);
    this.emit();
  }

  onCity(city: string | null): void {
    this.place = { ...this.place, city: city ?? '' };
    this.emit();
  }

  emit(): void {
    const custom = this.customText.trim();
    const place = this.customSelected ? this.place : null;
    const quote = this.quote;
    const refused = this.customSelected && !!quote && !quote.ok;
    this.selectionChange.emit({
      trainerLocationId: this.selectedId ?? undefined,
      customLocation: this.customSelected && custom ? custom : undefined,
      customLocationCountry: place?.country.trim() || undefined,
      customLocationState: place?.stateProvince.trim() || undefined,
      customLocationCity: place?.city.trim() || undefined,
      incomplete: this.customSelected && (!custom || !this.placeKnown || refused),
      fee: this.selectedFee,
      label: this.selectionLabel(custom),
    });
  }

  private selectionLabel(custom: string): string | undefined {
    if (this.customSelected) return custom ? `Your place: ${custom}` : undefined;
    const loc = this.locations.find(l => l.id === this.selectedId);
    if (!loc) return undefined;
    return [spotHeading(loc), loc.city, loc.country].filter(Boolean).join(', ') || undefined;
  }

  private setPlace(country: string, stateProvince: string, city: string): void {
    this.place = { country, stateProvince, city };
    this.loadStates(country, stateProvince);
  }

  private ensureCountries(): void {
    if (this.countriesLoaded) return;
    this.countriesLoaded = true;
    this.locationService.countries$.pipe(take(1)).subscribe(c => {
      this.countries = c;
      if (this.place.country) this.loadStates(this.place.country, this.place.stateProvince || null);
    });
  }

  /** Loads the state list for a country; with `thenState`, also that state's cities (used when filling in a known place). */
  private loadStates(country: string, thenState: string | null): void {
    this.states = [];
    this.cities = [];
    this.stateIds = new Map();
    const countryId = this.countries.find(c => normPlace(c.name) === normPlace(country))?.id;
    if (!countryId) return;
    this.loading = 'states';
    this.locationService.getStates(countryId).pipe(take(1)).subscribe(states => {
      this.stateIds = new Map(states.map(s => [s.name, s.id]));
      this.states = states.map(s => s.name);
      this.loading = null;
      if (thenState) this.loadCities(thenState);
    });
  }

  private loadCities(state: string): void {
    this.cities = [];
    const match = [...this.stateIds.keys()].find(name => normPlace(name) === normPlace(state));
    const stateId = match ? this.stateIds.get(match) : undefined;
    if (!stateId) return;
    this.loading = 'cities';
    this.locationService.getCities(stateId).pipe(take(1)).subscribe(cities => {
      this.cities = cities.map(c => c.name);
      this.loading = null;
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
    this.groups = this.buildGroups(this.locations);
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
        this.ensureCountries();
        this.setPlace(p.customLocationCountry ?? '', p.customLocationState ?? '', p.customLocationCity ?? '');
        changed = true;
      }
    }

    // A trainer edit between loads can orphan the selection.
    if (this.selectedId != null && !this.locations.some(l => l.id === this.selectedId)) { this.selectedId = null; changed = true; }
    if (!this.customAllowed && this.customSelected) { this.customSelected = false; changed = true; }
    if (changed) this.emit();
  }

  /** Spots grouped under their city, in the order the trainer's cities first appear. */
  private buildGroups(rows: TrainerLocation[]): LocationGroup[] {
    const groups: (LocationGroup & { key: TrainerLocation })[] = [];
    for (const row of rows) {
      let group = groups.find(g => sameCity(g.key, row));
      if (!group) {
        group = { key: row, title: placeLabel(row), rows: [] };
        groups.push(group);
      }
      group.rows.push(row);
    }
    return groups.map(({ title, rows }) => ({ title, rows }));
  }
}
