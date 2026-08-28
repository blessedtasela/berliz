import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { IconsModule } from '../icons/icons.module';

import { MessagesMainComponent } from './messages-main/messages-main.component';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';

@NgModule({
  declarations: [
    MessagesMainComponent,
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    FormsModule,
    IconsModule,
    FeatherModule,
  ]
})
export class MessagesModule { }
