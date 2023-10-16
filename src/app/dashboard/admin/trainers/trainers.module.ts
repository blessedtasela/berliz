import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainerListComponent } from './trainer-list/trainer-list.component';
import { AddTrainerComponent } from './add-trainer/add-trainer.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { UpdateTrainerComponent } from './update-trainer/update-trainer.component';
import { TrainerComponent } from './trainer/trainer.component';
import { TrainerDetailsComponent } from './trainer-details/trainer-details.component';
import { TrainerHeaderComponent } from './trainer-header/trainer-header.component';



@NgModule({
  declarations: [
    TrainerListComponent,
    AddTrainerComponent,
    UpdateTrainerComponent,
    TrainerComponent,
    TrainerDetailsComponent,
    TrainerHeaderComponent
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
export class TrainersModule { }
