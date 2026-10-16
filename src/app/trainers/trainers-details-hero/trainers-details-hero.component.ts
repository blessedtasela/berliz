import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Trainers } from 'src/app/models/trainers.interface';
import { LikersModalComponent } from 'src/app/shared/likers-modal/likers-modal.component';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';
import { groupLocations } from 'src/app/utils/trainer-location.util';

/**
 * Public hero header for a single trainer profile.
 * Built entirely from the real `Trainers` record (photoResponse / name /
 * motto / categories / experience / locations / serviceMode / likes).
 */
@Component({
    selector: 'app-trainers-details-hero',
    templateUrl: './trainers-details-hero.component.html',
    styleUrls: ['./trainers-details-hero.component.css'],
    standalone: false
})
export class TrainersDetailsHeroComponent {

  @Input() trainer: Trainers | null = null;
  @Input() reviewCount = 0;
  /** The hero's primary call to action; the page owns what booking means. */
  @Output() book = new EventEmitter<void>();
  /** "See plans & pricing": the page scrolls to its packages section. */
  @Output() seePackages = new EventEmitter<void>();

  /** Whether the "Available in" tile's location list dropdown is open. */
  locationsOpen = false;

  constructor(private elementRef: ElementRef<HTMLElement>, private dialog: MatDialog) { }

  viewLikers(): void {
    if (!this.trainer?.id) return;
    this.dialog.open(LikersModalComponent, {
      width: '380px',
      maxWidth: '95vw',
      data: { kind: 'trainer', id: this.trainer.id, routePrefix: '/user' }
    });
  }

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

  /** Maps search includes the gym/address when the trainer gave one, so it lands on the exact place. */
  mapsUrlFor(loc: { city: string; stateProvince?: string | null; country: string; venue?: string | null; address?: string | null }): string {
    const query = [loc.venue, loc.address, this.fullLocationLabel(loc)].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  /** The street address (or general area) shown under a named spot; empty when the address is the name itself. */
  spotAddress(loc: { venue?: string | null; address?: string | null }): string {
    return loc.venue?.trim() ? (loc.address?.trim() ?? '') : '';
  }

  /** A spot with no name shows its address as the heading instead of repeating the city. */
  spotHeading(loc: { venue?: string | null; address?: string | null }): string {
    return loc.venue?.trim() || loc.address?.trim() || '';
  }

  isApproximate(loc: { locationPrecision?: string | null; address?: string | null }): boolean {
    return loc.locationPrecision === 'AREA' && !!loc.address?.trim();
  }

  /**
   * What the trainer charges to come to a client's own place, across every place they'd go: the cities they
   * come to and, unless they only work inside those, anywhere else. Null when they don't offer it anywhere.
   */
  private clientPlaceFees(): number[] | null {
    const t = this.trainer;
    if (!t?.customLocationAllowed) return null;
    const base = t.customLocationFee ?? 0;
    const fees = groupLocations(t.locations).filter(a => a.clientAllowed).map(a => a.clientFee ?? base);
    if (t.customLocationOutsideAllowed !== false) fees.push(t.customLocationOutsideFee ?? base);
    return fees.length > 0 ? fees : null;
  }

  get offersClientPlace(): boolean {
    return this.clientPlaceFees() !== null;
  }

  /** "No extra fee", "+$20.00" or "+$10.00 – $40.00" when it depends on where the client is. */
  get clientPlaceFeeLabel(): string {
    const fees = this.clientPlaceFees();
    if (!fees) return '';
    const low = Math.min(...fees);
    const high = Math.max(...fees);
    if (high <= 0) return 'No extra fee';
    const money = (n: number) => n.toFixed(2);
    if (low === high) return `+$${money(high)}`;
    return low === 0 ? `up to +$${money(high)}` : `+$${money(low)} – $${money(high)}`;
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
