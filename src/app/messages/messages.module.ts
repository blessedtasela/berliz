import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FeatherModule } from 'angular-feather';
import { IconsModule } from '../icons/icons.module';
import { SharedModule } from '../shared/shared.module';

import { MessagesMainComponent } from './messages-main/messages-main.component';
import { ChatThreadHeaderComponent } from './shared/chat-thread-header/chat-thread-header.component';
import { MessageBubbleComponent } from './shared/message-bubble/message-bubble.component';
import { ConversationRowComponent } from './shared/conversation-row/conversation-row.component';
import { MessageComposerComponent } from './shared/message-composer/message-composer.component';

@NgModule({
  declarations: [
    MessagesMainComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IconsModule,
    FeatherModule,
    SharedModule,
    ChatThreadHeaderComponent,
    MessageBubbleComponent,
    ConversationRowComponent,
    MessageComposerComponent,
  ]
})
export class MessagesModule { }
