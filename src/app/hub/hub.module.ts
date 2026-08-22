import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HubMainComponent } from './hub-main/hub-main.component';
import { HubRouteComponent } from './hub-route/hub-route.component';
import { HubHeaderComponent } from './hub-header/hub-header.component';
import { HubGridComponent } from './hub-grid/hub-grid.component';
import { HubCardComponent } from './hub-card/hub-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { IconsModule } from '../icons/icons.module';
import { FooterModule } from '../footer/footer.module';
import { NavbarModule } from '../navbar/navbar.module';
import { SearchModule } from '../shared/search/search.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    HubMainComponent,
    HubRouteComponent,
    HubHeaderComponent,
    HubGridComponent,
    HubCardComponent,
  ],
  imports: [
    CommonModule,
    IconsModule,
    NavbarModule,
    FooterModule,
    FormsModule,
    ReactiveFormsModule,
    SearchModule,
    FeatherModule,
    RouterModule
  ]
})
export class HubModule { }
