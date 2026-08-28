import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FeatherModule } from 'angular-feather';
import { IconsModule } from '../icons/icons.module';

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
  ]
})
export class ConnectionsModule { }
