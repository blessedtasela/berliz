import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AddTrainerModalComponent } from './add-trainer-modal/add-trainer-modal.component';
import { TrainerDetailsModalComponent } from './trainer-details-modal/trainer-details-modal.component';
import { TrainerHeaderComponent } from './trainer-header/trainer-header.component';
import { TrainerListComponent } from './trainer-list/trainer-list.component';
import { TrainersComponent } from './trainers/trainers.component';
import { UpdateTrainerModalComponent } from './update-trainer-modal/update-trainer-modal.component';



@NgModule({
  declarations: [
    AddTrainerModalComponent,
    TrainerDetailsModalComponent,
    TrainerHeaderComponent,
    TrainerListComponent,
    TrainersComponent,
    UpdateTrainerModalComponent,
  ],

  imports: [
    CommonModule,
    NavbarModule,
    FooterModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
  ]
})
export class TrainersModule { }
