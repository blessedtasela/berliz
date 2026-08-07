import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { IconsModule } from 'src/app/icons/icons.module';

/**
 * A user reference inside an admin table: shows the name/email as an inline
 * trigger, reveals a small preview card on hover, and navigates to
 * `/user/{id}` on click.
 *
 * The card is `position: fixed` and positioned from the trigger's bounding
 * rect rather than being absolutely positioned inside the cell. Every admin
 * table wraps its `<table>` in an `overflow-x-auto` scroller, which would clip
 * an absolutely-positioned popup at the row boundary.
 *
 * Standalone so each admin feature module can import it directly — the app's
 * SharedModule pulls in AppRoutingModule (RouterModule.forRoot), which cannot
 * be imported from a lazy-loaded module.
 */
@Component({
  selector: 'app-user-hover-card',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './user-hover-card.component.html'
})
export class UserHoverCardComponent {

  /** Target user. Without it the component degrades to plain, non-interactive text. */
  @Input() userId: number | null | undefined = null;

  @Input() firstname: string | null | undefined = null;
  @Input() lastname: string | null | undefined = null;

  /** Base64 profile photo bytes, as returned by the API. */
  @Input() photo: any = null;

  @Input() role: string | null | undefined = null;
  @Input() email: string | null | undefined = null;

  /** What the table cell itself shows. Falls back to the user's full name. */
  @Input() label: string | null | undefined = null;

  @ViewChild('trigger') triggerRef?: ElementRef<HTMLElement>;

  open = false;
  cardTop = 0;
  cardLeft = 0;

  private static readonly CARD_WIDTH = 240;
  private static readonly CARD_HEIGHT = 132;

  constructor(private router: Router) {}

  get fullName(): string {
    return `${this.firstname ?? ''} ${this.lastname ?? ''}`.trim();
  }

  get displayLabel(): string {
    return this.label || this.fullName || this.email || '—';
  }

  /** Only a row that actually carries a user id can be hovered or clicked. */
  get isLinked(): boolean {
    return !!this.userId;
  }

  get photoSrc(): string {
    return this.photo
      ? 'data:image/*;base64,' + this.photo
      : '../../../assets/icons/user.png';
  }

  get initials(): string {
    const first = (this.firstname ?? '').charAt(0);
    const last = (this.lastname ?? '').charAt(0);
    return (first + last).toUpperCase() || '?';
  }

  onEnter(): void {
    if (!this.isLinked) return;

    const rect = this.triggerRef?.nativeElement.getBoundingClientRect();
    if (!rect) return;

    // Flip above / left when the default placement would run off screen.
    const spaceBelow = window.innerHeight - rect.bottom;
    this.cardTop = spaceBelow < UserHoverCardComponent.CARD_HEIGHT + 12
      ? rect.top - UserHoverCardComponent.CARD_HEIGHT - 8
      : rect.bottom + 8;

    const maxLeft = window.innerWidth - UserHoverCardComponent.CARD_WIDTH - 12;
    this.cardLeft = Math.max(12, Math.min(rect.left, maxLeft));

    this.open = true;
  }

  onLeave(): void {
    this.open = false;
  }

  /** A fixed-position card would detach from its trigger once the page scrolls. */
  @HostListener('window:scroll')
  @HostListener('window:resize')
  onViewportChange(): void {
    this.open = false;
  }

  navigate(): void {
    if (!this.isLinked) return;
    this.open = false;
    this.router.navigate(['/user', this.userId]);
  }
}
