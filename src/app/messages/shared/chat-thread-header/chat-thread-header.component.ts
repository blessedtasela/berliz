import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';
import { AvatarComponent } from 'src/app/shared/avatar/avatar.component';

/**
 * Header for an open thread -- avatar, name, and (this is the
 * Berliz-specific touch) the same "Berliz Certified Trainer/Center" eyebrow
 * badge already used on trainer/center detail pages, so a chat with a real
 * marketplace trainer or center reads as verified, not like a generic DM.
 * Swaps to a "typing…" line in place of that badge while the other party
 * is typing.
 */
@Component({
  selector: 'app-chat-thread-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, AvatarComponent],
  templateUrl: './chat-thread-header.component.html',
})
export class ChatThreadHeaderComponent {
  @Input() userId!: number;
  @Input() name = '';
  @Input() photo: string | null | undefined;
  @Input() role: string | null | undefined;
  @Input() typing = false;
  @Input() showBack = false;
  @Input() showClose = false;

  @Output() back = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  get certifiedLabel(): string | null {
    if (this.role === 'trainer') return 'Berliz Certified Trainer';
    if (this.role === 'center') return 'Berliz Certified Center';
    return null;
  }
}
