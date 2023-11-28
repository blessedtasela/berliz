import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MuscleGroupsComponent } from './muscle-groups/muscle-groups.component';
import { AddMuscleGroupModalComponent } from './add-muscle-group-modal/add-muscle-group-modal.component';
import { MuscleGroupsHeaderComponent } from './muscle-groups-header/muscle-groups-header.component';
import { MuscleGroupsListComponent } from './muscle-groups-list/muscle-groups-list.component';
import { UpdateMuscleGroupModalComponent } from './update-muscle-group-modal/update-muscle-group-modal.component';
import { MuscleGroupDetailsModalComponent } from './muscle-group-details-modal/muscle-group-details-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';



@NgModule({
  declarations: [
    MuscleGroupsComponent,
    AddMuscleGroupModalComponent,
    MuscleGroupsHeaderComponent,
    MuscleGroupsListComponent,
    UpdateMuscleGroupModalComponent,
    MuscleGroupDetailsModalComponent
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
export class MuscleGroupsModule { }
