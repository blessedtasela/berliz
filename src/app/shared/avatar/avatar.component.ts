import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

/**
 * Photo-or-initials avatar, standalone so it can drop into any module
 * without wiring. Same fallback logic as UserHoverCardComponent's
 * `photoSrc`/`initials` getters (user-hover-card.component.ts) -- kept in
 * sync rather than diverging into a third copy-paste, since messaging and
 * the dashboard both need this and neither is really "the" user card.
 */
@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <img *ngIf="photoSrc; else initialsFallback" [src]="photoSrc" alt=""
      class="rounded-full object-cover object-top border shrink-0"
      [ngClass]="borderClass"
      [style.width.px]="size" [style.height.px]="size" />
    <ng-template #initialsFallback>
      <div class="rounded-full flex items-center justify-center font-bold shrink-0 border"
        [ngClass]="borderClass"
        [style.width.px]="size" [style.height.px]="size"
        [style.font-size.px]="size * 0.4">
        {{ initials }}
      </div>
    </ng-template>
  `,
})
export class AvatarComponent {
  /** Base64 photo payload (same encoding as User.profilePhoto elsewhere), or null/undefined for the initials fallback. */
  @Input() photo: string | null | undefined;
  @Input() name = '';
  @Input() size = 36;
  /** Tailwind classes for the ring/background -- callers pick a palette (e.g. red for messaging, gray for a neutral list). */
  @Input() borderClass = 'border-gray-200 bg-gray-50 text-gray-500';

  get photoSrc(): string | null {
    return this.photo ? 'data:image/*;base64,' + this.photo : null;
  }

  get initials(): string {
    const parts = this.name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase() || '?';
  }
}
