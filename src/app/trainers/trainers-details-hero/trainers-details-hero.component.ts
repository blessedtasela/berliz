import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { Trainers } from 'src/app/models/trainers.interface';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

/**
 * Public hero header for a single trainer profile.
 * Built entirely from the real `Trainers` record (photoResponse / name /
 * motto / categories / experience / locations / serviceMode / likes).
 */
@Component({
  selector: 'app-trainers-details-hero',
  templateUrl: './trainers-details-hero.component.html',
  styleUrls: ['./trainers-details-hero.component.css']
})
export class TrainersDetailsHeroComponent {

  @Input() trainer: Trainers | null = null;
  @Input() reviewCount = 0;

  /** Whether the "Available in" tile's location list dropdown is open. */
  locationsOpen = false;

  constructor(private elementRef: ElementRef<HTMLElement>) { }

  get photoUrl(): string {
    const url = this.trainer?.photoResponse?.photoUrl;
    return url ? resolveStrapiUrl(url) : 'assets/avatar.png';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }

  /** "Vancouver, CA" for the first listed location, "+N more" appended in the template. */
  get primaryLocationLabel(): string {
    const first = this.trainer?.locations?.[0];
    if (!first) return '—';
    return [first.city, first.country].filter(Boolean).join(', ');
  }

  get extraLocationCount(): number {
    return Math.max(0, (this.trainer?.locations?.length ?? 0) - 1);
  }

  get hasLocations(): boolean {
    return (this.trainer?.locations?.length ?? 0) > 0;
  }

  /** "Vancouver, British Columbia, Canada" — full label for a row inside the dropdown. */
  fullLocationLabel(loc: { city: string; stateProvince?: string | null; country: string }): string {
    return [loc.city, loc.stateProvince, loc.country].filter(Boolean).join(', ');
  }

  mapsUrlFor(loc: { city: string; stateProvince?: string | null; country: string }): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.fullLocationLabel(loc))}`;
  }

  toggleLocations(): void {
    if (!this.hasLocations) return;
    this.locationsOpen = !this.locationsOpen;
  }

  // Closes the dropdown on any click outside this component, same pattern as
  // every other menu/dropdown in the app — otherwise it stays open forever
  // once opened, since there's no backdrop.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.locationsOpen && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.locationsOpen = false;
    }
  }

  get serviceModeLabel(): string {
    switch (this.trainer?.serviceMode) {
      case 'ONLINE': return 'Online';
      case 'HYBRID': return 'Hybrid';
      case 'IN_PERSON':
      default: return 'In-person';
    }
  }

  get serviceModeDescription(): string {
    switch (this.trainer?.serviceMode) {
      case 'ONLINE': return 'Coaches remotely only — no in-person sessions.';
      case 'HYBRID': return 'Offers both in-person and online sessions.';
      case 'IN_PERSON':
      default: return 'In-person sessions only — no remote coaching.';
    }
  }
}
