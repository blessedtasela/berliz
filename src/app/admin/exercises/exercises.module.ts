import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExercisesComponent } from './exercises/exercises.component';
import { ExercisesListComponent } from './exercises-list/exercises-list.component';
import { ExercisesHeaderComponent } from './exercises-header/exercises-header.component';
import { ExercisesDetailsModalComponent } from './exercises-details-modal/exercises-details-modal.component';
import { ExerciseDetailPageComponent } from './exercise-detail-page/exercise-detail-page.component';
import { AddExercisesModalComponent } from './add-exercises-modal/add-exercises-modal.component';
import { UpdateExercisesModalComponent } from './update-exercises-modal/update-exercises-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';



@NgModule({
  declarations: [
    ExercisesComponent,
    ExercisesListComponent,
    ExercisesHeaderComponent,
    ExercisesDetailsModalComponent,
    ExerciseDetailPageComponent,
    AddExercisesModalComponent,
    UpdateExercisesModalComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterModule,
    NavbarModule,
    AdminSearchModule,
    StrapiUrlPipe,
    RouterModule.forChild([
      { path: '', component: ExercisesComponent },
      { path: ':id', component: ExerciseDetailPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Exercise Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class ExercisesModule { }
