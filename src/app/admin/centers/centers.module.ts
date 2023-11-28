import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconsModule } from 'src/app/icons/icons.module';
import { AddCenterModalComponent } from './add-center-modal/add-center-modal.component';
import { CenterDetailsModalComponent } from './center-details-modal/center-details-modal.component';
import { CenterHeaderComponent } from './center-header/center-header.component';
import { CenterListComponent } from './center-list/center-list.component';
import { CentersComponent } from './centers/centers.component';
import { UpdateCenterModalComponent } from './update-center-modal/update-center-modal.component';
import { FooterModule } from 'src/app/footer/footer.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';



@NgModule({
  declarations: 
  [
    AddCenterModalComponent,
    CenterDetailsModalComponent,
    CenterHeaderComponent,
    CenterListComponent,
    CentersComponent,
    UpdateCenterModalComponent
  ],

  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterModule,
    NavbarModule
  ]
})
export class CentersModule { }
