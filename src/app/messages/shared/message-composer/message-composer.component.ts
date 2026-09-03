import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';

/**
 * Compose bar -- input + send. Emits `typing(true)` as soon as the user
 * starts typing and `typing(false)` ~2s after they stop, so both the popup
 * and the full page get a real typing indicator for free instead of each
 * hand-rolling the same debounce.
 */
@Component({
  selector: 'app-message-composer',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './message-composer.component.html',
})
export class MessageComposerComponent implements OnDestroy {
  @Input() placeholder = 'Type a message…';

  @Output() send = new EventEmitter<string>();
  @Output() typing = new EventEmitter<boolean>();

  body = '';

  private isTyping = false;
  private stopTypingTimer: ReturnType<typeof setTimeout> | null = null;

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

    this.send.emit(trimmed);
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
