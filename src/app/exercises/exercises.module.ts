import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconsModule } from '../icons/icons.module';
import { ExercisesSectionComponent } from './exercises-section/exercises-section.component';
import { ExerciseHeroComponent } from './exercise-hero/exercise-hero.component';
import { ExerciseSearchComponent } from './exercise-search/exercise-search.component';
import { ExerciseSearchResultComponent } from './exercise-search-result/exercise-search-result.component';
import { ExerciseHeroDetailsComponent } from './exercise-hero-details/exercise-hero-details.component';
import { ExerciseMuscleGroupsComponent } from './exercise-muscle-groups/exercise-muscle-groups.component';
import { ExerciseIntroductionComponent } from './exercise-introduction/exercise-introduction.component';
import { ExerciseTipsComponent } from './exercise-tips/exercise-tips.component';
import { ExercisesPageComponent } from './exercises-page/exercises-page.component';
import { FooterModule } from '../footer/footer.module';

@NgModule({
  declarations: [
    ExerciseHeroComponent,
    ExerciseSearchComponent,
    ExerciseSearchResultComponent,
    ExerciseHeroDetailsComponent,
    ExerciseMuscleGroupsComponent,
    ExerciseIntroductionComponent,
    ExerciseTipsComponent,
    ExercisesPageComponent,
    ExercisesSectionComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IconsModule,
    FooterModule
  ],
  exports: [
    // Rendered as the movement-library section of the Programs page (`/services`).
    ExercisesSectionComponent
  ]
})
export class ExercisesModule { }
