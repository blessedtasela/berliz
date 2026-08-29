import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FeatherModule } from 'angular-feather';
import { IconsModule } from '../icons/icons.module';
import { SharedModule } from '../shared/shared.module';

import { MessagesMainComponent } from './messages-main/messages-main.component';

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
  ]
})
export class MessagesModule { }
