import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconsModule } from 'src/app/icons/icons.module';
import { Message } from 'src/app/models/message.model';

/**
 * One message bubble -- mine (red, right-aligned) or theirs (gray, left).
 * Renders the two states the backend has always supported but the UI never
 * showed: an "(edited)" label once `editedAt` is set, and a muted "Message
 * unsent" placeholder once `deleted` is true. `isLastMine` drives the
 * Instagram-style "Seen" read receipt under your own most recent message.
 */
@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './message-bubble.component.html',
})
export class MessageBubbleComponent {
  @Input({ required: true }) message!: Message;
  @Input() mine = false;
  @Input() isLastMine = false;

  /** Emits this message's id when the "Unsend" action is used. */
  @Output() unsend = new EventEmitter<number>();

  get canUnsend(): boolean {
    return this.mine && !this.message.deleted;
  }
}
