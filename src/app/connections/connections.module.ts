import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { IconsModule } from '../icons/icons.module';
import { SharedModule } from '../shared/shared.module';

import { ConnectionsMainComponent } from './connections-main/connections-main.component';

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
  ]
})
export class ConnectionsModule { }
