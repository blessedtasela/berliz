import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CenterComponent } from './center/center.component';
import { CenterListComponent } from './center-list/center-list.component';
import { CenterDetailsComponent } from './center-details/center-details.component';
import { CenterHeaderComponent } from './center-header/center-header.component';
import { AddCenterComponent } from './add-center/add-center.component';
import { UpdateCentersComponent } from './update-centers/update-centers.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';



@NgModule({
  declarations: [
    CenterComponent,
    CenterListComponent,
    CenterDetailsComponent,
    CenterHeaderComponent,
    AddCenterComponent,
    UpdateCentersComponent,
  ],
  imports: [
    CommonModule,
    IconsModule,
    NavbarModule,
    FooterModule,
    ReactiveFormsModule,
    FormsModule,
    FooterModule
  ]
})
export class CentersModule { }
