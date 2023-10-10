import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainerComponent } from './trainer/trainer.component';
import { TrainerListComponent } from './trainer-list/trainer-list.component';
import { TrainerDetailsComponent } from './trainer-details/trainer-details.component';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddTrainerComponent } from './add-trainer/add-trainer.component';
import { TrainerHeaderComponent } from './trainer-header/trainer-header.component';



@NgModule({
  declarations: [
    TrainerComponent,
    TrainerListComponent,
    TrainerDetailsComponent,
    AddTrainerComponent,
    TrainerHeaderComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    NavbarModule,
    FooterModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class TrainerModule { }
