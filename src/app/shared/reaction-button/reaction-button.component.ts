import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { REACTIONS, ReactionType, reactionEmoji } from 'src/app/models/post.interface';

/**
 * The reaction control shared by every post card and comment: a trigger that
 * plain-clicks to toggle a 👍, and reveals a 👍💪🔥👏❤️ picker on hover
 * (desktop) or long-press (touch). A separate "N reactions" affordance next to
 * it opens the "who reacted" list. One component so the behaviour and styling
 * stay identical on the feed, both profile pages, and comment threads.
 */
@Component({
  selector: 'app-reaction-button',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './reaction-button.component.html',
  styleUrls: ['./reaction-button.component.css'],
})
export class ReactionButtonComponent {
  /** The viewer's current reaction name, or null. */
  @Input() myReaction?: string | null;
  /** Total reactions of any type. */
  @Input() count = 0;
  /** Dark palette (comment threads inside the media sheet / public profile). */
  @Input() dark = false;
  /** 'sm' for the tight inline treatment (public profile, comments), 'md' for the feed pill. */
  @Input() size: 'sm' | 'md' = 'md';

  /** Emits the chosen reaction name (or the current one again, meaning "remove"). */
  @Output() react = new EventEmitter<ReactionType>();
  /** Ask the host to open the "who reacted" list. */
  @Output() openList = new EventEmitter<void>();

  readonly reactions = REACTIONS;
  pickerOpen = false;

  private hoverTimer: ReturnType<typeof setTimeout> | null = null;
  private pressTimer: ReturnType<typeof setTimeout> | null = null;

  get reacted(): boolean {
    return !!this.myReaction;
  }

  get triggerEmoji(): string {
    return reactionEmoji(this.myReaction);
  }

  get triggerLabel(): string {
    return REACTIONS.find(r => r.type === this.myReaction)?.label ?? 'Like';
  }

  /** Plain click: react with LIKE, or clear the current reaction. */
  onTrigger(): void {
    this.closePicker();
    this.react.emit((this.myReaction as ReactionType) ?? 'LIKE');
  }

  pick(type: ReactionType): void {
    this.closePicker();
    this.react.emit(type);
  }

  // ── hover (desktop) ──────────────────────────────────────────────────────
  onEnter(): void {
    this.clearHoverTimer();
    this.hoverTimer = setTimeout(() => (this.pickerOpen = true), 320);
  }

  onLeave(): void {
    this.clearHoverTimer();
    // small grace period so moving between trigger and popover doesn't dismiss it
    this.hoverTimer = setTimeout(() => (this.pickerOpen = false), 160);
  }

  // ── long-press (touch) ──────────────────────────────────────────────────
  onPressStart(): void {
    this.clearPressTimer();
    this.pressTimer = setTimeout(() => (this.pickerOpen = true), 450);
  }

  onPressEnd(): void {
    this.clearPressTimer();
  }

  @HostListener('document:keydown.escape')
  closePicker(): void {
    this.pickerOpen = false;
    this.clearHoverTimer();
    this.clearPressTimer();
  }

  private clearHoverTimer(): void {
    if (this.hoverTimer) { clearTimeout(this.hoverTimer); this.hoverTimer = null; }
  }
  private clearPressTimer(): void {
    if (this.pressTimer) { clearTimeout(this.pressTimer); this.pressTimer = null; }
  }
}
