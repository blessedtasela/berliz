import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { IconsModule } from 'src/app/icons/icons.module';
import { Message } from 'src/app/models/message.model';
import { StrapiService } from 'src/app/services/strapi.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

export interface ComposerSendPayload {
  body: string;
  replyToMessageId: number | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentMime?: string | null;
  attachmentSize?: number | null;
}

interface PendingAttachment {
  url: string;
  name: string;
  mime: string;
  size: number;
}

/** Matches nothing this app already enforces elsewhere -- a plain sanity cap so one
 *  giant file can't hang the upload or blow past Strapi's own server-side limit. */
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

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
 *
 * A picked image/file uploads to Strapi immediately (same path every other
 * photo upload in this app uses, see StrapiService) so `submit()` just
 * attaches the already-hosted URL -- sending isn't gated on a slow upload.
 * Attachments aren't supported while editing: the backend's edit endpoint
 * only ever touches the body.
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
  pendingAttachment: PendingAttachment | null = null;
  uploadingAttachment = false;

  private isTyping = false;
  private stopTypingTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private strapiService: StrapiService,
    private snackBar: SnackBarService,
  ) { }

  get isEditing(): boolean {
    return !!this.editingMessage;
  }

  get isImageAttachment(): boolean {
    return !!this.pendingAttachment?.mime.startsWith('image/');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = ''; // allow picking the exact same file again later

    if (!file) return;
    if (file.size > MAX_ATTACHMENT_BYTES) {
      this.snackBar.openSnackBar('That file is too large to attach (max 25MB).', 'error');
      return;
    }

    this.uploadingAttachment = true;
    this.strapiService.uploadToStrapi(file).pipe(take(1)).subscribe({
      next: (uploaded) => {
        this.uploadingAttachment = false;
        const first = uploaded[0];
        if (!first) return;
        this.pendingAttachment = { url: first.fullUrl, name: file.name, mime: file.type, size: file.size };
      },
      error: () => {
        this.uploadingAttachment = false;
        this.snackBar.openSnackBar('Could not upload that file. Try again.', 'error');
      },
    });
  }

  removeAttachment(): void {
    this.pendingAttachment = null;
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

    if (this.editingMessage) {
      if (!trimmed) return;
      this.saveEdit.emit({ messageId: this.editingMessage.id, body: trimmed });
    } else {
      if (!trimmed && !this.pendingAttachment) return;
      this.send.emit({
        body: trimmed,
        replyToMessageId: this.replyTo?.id ?? null,
        attachmentUrl: this.pendingAttachment?.url ?? null,
        attachmentName: this.pendingAttachment?.name ?? null,
        attachmentMime: this.pendingAttachment?.mime ?? null,
        attachmentSize: this.pendingAttachment?.size ?? null,
      });
      if (this.replyTo) this.cancelReply.emit();
      this.pendingAttachment = null;
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
