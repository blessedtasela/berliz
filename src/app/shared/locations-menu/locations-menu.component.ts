import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';

export interface LocationMenuItem {
  /** First line: the venue/branch name, or the place itself when there is no venue. */
  title: string;
  /** Second line, e.g. the city/address under a venue name. */
  subtitle?: string | null;
  /** Opens in a new tab (Google Maps). Omit for a non-clickable row. */
  href?: string | null;
  /** Right-aligned note, e.g. "+$15.00" or "No extra fee". */
  note?: string | null;
  /** Colours `note` amber (a surcharge) instead of muted grey. */
  noteHighlight?: boolean;
}

export interface LocationMenuFooter {
  text: string;
  note?: string | null;
  noteHighlight?: boolean;
}

/**
 * Stat tile for the signed-in (light/dark dashboard) provider profiles that
 * lists *every* place a trainer or center works from. The tile always says how
 * many locations there are; with more than one it opens a dropdown of all of
 * them. (The public pages have their own dark-themed copy of this in the
 * trainer hero.)
 */
@Component({
  selector: 'app-locations-menu',
  imports: [CommonModule, IconsModule],
  templateUrl: './locations-menu.component.html'
})
export class LocationsMenuComponent {

  @Input() label = 'Available in';
  /** What the tile shows before it is opened, e.g. "Surrey, Canada". */
  @Input() summary: string | null | undefined = null;
  @Input() items: LocationMenuItem[] = [];
  /** Extra row under the list, e.g. "Or train at a place of your choice". */
  @Input() footer: LocationMenuFooter | null = null;

  open = false;

  constructor(private elementRef: ElementRef<HTMLElement>) { }

  get count(): number {
    return this.items.length;
  }

  get hasMany(): boolean {
    return this.count > 1;
  }

  /** Even a single location opens: its venue and fee live in the list, not on the tile. */
  get openable(): boolean {
    return this.count > 0 || !!this.footer;
  }

  get countLabel(): string {
    return this.count === 1 ? '1 location' : `${this.count} locations`;
  }

  toggle(): void {
    if (!this.openable) return;
    this.open = !this.open;
  }

  // Same click-outside pattern as the other dropdowns in the app: there is no
  // backdrop, so without this the list would stay open once opened.
  //
  // "Inside" is decided from the event's composed path, not `target.contains`:
  // the tile's chevron is swapped while the click is still bubbling, so by the
  // time it reaches `document` the clicked <svg> is detached and `contains`
  // says false -- the menu closed the instant it opened whenever the chevron
  // (or a row's icon) took the tap.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open) return;
    const host = this.elementRef.nativeElement;
    const inside = event.composedPath().includes(host) || host.contains(event.target as Node);
    if (!inside) this.open = false;
  }

  trackByIndex(index: number): number {
    return index;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open = false;
  }
}
