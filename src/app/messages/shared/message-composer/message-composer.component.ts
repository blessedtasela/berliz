import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { IconsModule } from 'src/app/icons/icons.module';
import { Message } from 'src/app/models/message.model';
import { StrapiService } from 'src/app/services/strapi.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { validateUpload } from 'src/app/utils/media-upload.util';

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

/**
 * A plain sanity cap so one giant file can't hang a chat upload (the server's own limit is higher).
 * What may be attached follows the server's allow-list (images, video, PDF, Word/Excel/PowerPoint,
 * text/CSV, audio) -- see validateUpload; anything else would only be refused by the server, so it is
 * turned away here with the reason instead of failing after the upload.
 */
const MAX_ATTACHMENT_MB = 25;

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
    imports: [CommonModule, FormsModule, IconsModule, SharedModule],
    templateUrl: './message-composer.component.html'
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
  /** Inline reason the picked file was rejected or failed to upload; shown above the input row. */
  attachmentError: string | null = null;

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
    this.attachmentError = null;
    const problem = validateUpload(file, { maxMb: MAX_ATTACHMENT_MB });
    if (problem) {
      this.attachmentError = problem;
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
      error: (err) => {
        this.uploadingAttachment = false;
        this.attachmentError = err?.error?.message || `"${file.name}" could not be uploaded. Try attaching it again.`;
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
