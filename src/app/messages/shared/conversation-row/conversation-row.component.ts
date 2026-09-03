import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AvatarComponent } from 'src/app/shared/avatar/avatar.component';

/** Shape both a real ConversationSummary and a "start a conversation" StartableContact can satisfy. */
export interface ConversationRowData {
  userId: number;
  name: string;
  photo?: string | null;
  preview?: string;
  unreadCount?: number;
}

/** One row in the conversation list -- reused by the full-page inbox and the popup's list view. */
@Component({
  selector: 'app-conversation-row',
  standalone: true,
  imports: [CommonModule, RouterModule, AvatarComponent],
  templateUrl: './conversation-row.component.html',
})
export class ConversationRowComponent {
  @Input({ required: true }) row!: ConversationRowData;
  @Input() active = false;

  @Output() open = new EventEmitter<number>();
}
