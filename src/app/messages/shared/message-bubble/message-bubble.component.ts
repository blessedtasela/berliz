import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconsModule } from 'src/app/icons/icons.module';
import { Message } from 'src/app/models/message.model';

/** How long after sending the sender may still edit — mirrors the backend's
 *  own EDIT_WINDOW_MS (MessageServiceImplement). Only gates whether the Edit
 *  button shows; the backend re-checks this for real on every edit request. */
const EDIT_WINDOW_MS = 60 * 60 * 1000;

/**
 * One message bubble -- mine (red, right-aligned) or theirs (gray, left).
 * Renders: an "(edited)" label once `editedAt` is set, a muted "Message
 * unsent" placeholder once `deleted` is true, a quoted-reply preview when
 * this message is replying to another, and (on hover) Reply/Edit/Unsend
 * actions. `isLastMine` drives the Instagram-style "Seen" read receipt under
 * your own most recent message.
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

  /** Emits this message's id when the "Unsend" action is used (parent shows the confirmation). */
  @Output() unsend = new EventEmitter<number>();
  /** Emits the whole message so the composer can pre-fill a quote preview. */
  @Output() reply = new EventEmitter<Message>();
  /** Emits the whole message so the composer can switch into edit mode. */
  @Output() edit = new EventEmitter<Message>();

  get canUnsend(): boolean {
    return this.mine && !this.message.deleted;
  }

  get canEdit(): boolean {
    if (!this.mine || this.message.deleted) return false;
    const sentAt = new Date(this.message.date).getTime();
    return Date.now() - sentAt < EDIT_WINDOW_MS;
  }

  get canReply(): boolean {
    return !this.message.deleted;
  }
}
