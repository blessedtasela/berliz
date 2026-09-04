import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FeatherModule } from 'angular-feather';
import { IconsModule } from '../icons/icons.module';
import { SharedModule } from '../shared/shared.module';

import { ConnectionsMainComponent } from './connections-main/connections-main.component';
import { ProposeSessionModalComponent } from '../peer-sessions/propose-session-modal/propose-session-modal.component';

@NgModule({
  declarations: [
    ConnectionsMainComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    IconsModule,
    FeatherModule,
    FormsModule,
    SharedModule,
    MatDialogModule,
    ProposeSessionModalComponent,
  ]
})
export class ConnectionsModule { }
