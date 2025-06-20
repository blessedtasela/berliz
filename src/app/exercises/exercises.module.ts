import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  ],
  imports: [
    CommonModule,
    FooterModule
  ]
})
export class ExercisesModule { }
