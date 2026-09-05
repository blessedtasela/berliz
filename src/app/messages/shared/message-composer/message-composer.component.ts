import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { Message } from 'src/app/models/message.model';

export interface ComposerSendPayload {
  body: string;
  replyToMessageId: number | null;
}

/**
 * Compose bar -- input + send, plus reply-with-quote and edit-in-place.
 * Emits `typing(true)` as soon as the user starts typing and `typing(false)`
 * ~2s after they stop, so both the popup and the full page get a real
 * typing indicator for free instead of each hand-rolling the same debounce.
 *
 * Two mutually-exclusive modes driven by inputs, both settable from a
 * message-bubble's "Reply"/"Edit" action:
 *  - `replyTo` set: a quote-preview strip shows above the input; sending
 *    attaches `replyToMessageId` to the outgoing message.
 *  - `editingMessage` set: the input is pre-filled with that message's body
 *    and submitting emits `saveEdit` instead of `send`.
 */
@Component({
  selector: 'app-message-composer',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './message-composer.component.html',
})
export class MessageComposerComponent implements OnChanges, OnDestroy {
  @Input() placeholder = 'Type a message…';
  @Input() replyTo: Message | null = null;
  @Input() editingMessage: Message | null = null;

  @Output() send = new EventEmitter<ComposerSendPayload>();
  @Output() saveEdit = new EventEmitter<{ messageId: number; body: string }>();
  @Output() cancelReply = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() typing = new EventEmitter<boolean>();

  body = '';

  private isTyping = false;
  private stopTypingTimer: ReturnType<typeof setTimeout> | null = null;

  get isEditing(): boolean {
    return !!this.editingMessage;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Entering edit mode pre-fills the box; leaving it (cancelled or saved)
    // clears whatever was typed rather than leaving a stale draft behind.
    if (changes['editingMessage']) {
      this.body = this.editingMessage ? this.editingMessage.body : '';
    }
  }

  onInput(): void {
    if (!this.isTyping) {
      this.isTyping = true;
      this.typing.emit(true);
    }

    if (this.stopTypingTimer) clearTimeout(this.stopTypingTimer);
    this.stopTypingTimer = setTimeout(() => {
      this.isTyping = false;
      this.typing.emit(false);
    }, 2000);
  }

  submit(): void {
    const trimmed = this.body.trim();
    if (!trimmed) return;

    if (this.editingMessage) {
      this.saveEdit.emit({ messageId: this.editingMessage.id, body: trimmed });
    } else {
      this.send.emit({ body: trimmed, replyToMessageId: this.replyTo?.id ?? null });
      if (this.replyTo) this.cancelReply.emit();
    }
    this.body = '';

    if (this.stopTypingTimer) clearTimeout(this.stopTypingTimer);
    if (this.isTyping) {
      this.isTyping = false;
      this.typing.emit(false);
    }
  }

  ngOnDestroy(): void {
    if (this.stopTypingTimer) clearTimeout(this.stopTypingTimer);
    if (this.isTyping) this.typing.emit(false);
  }
}
