import { Component, Input } from '@angular/core';
import { PublicExercise } from 'src/app/models/exercise.interface';
import { exerciseDemoUrl } from 'src/app/utils/exercise-demo';

/**
 * "Exercises tagged with this discipline" — DERIVED client-side from
 * `Exercise.categories`. There is no per-category exercise endpoint.
 */
@Component({
    selector: 'app-category-exercises',
    templateUrl: './category-exercises.component.html',
    styleUrls: ['./category-exercises.component.css'],
    standalone: false
})
export class CategoryExercisesComponent {
  @Input() exercises: PublicExercise[] = [];
  @Input() categoryName = '';

  demoUrl = exerciseDemoUrl;

  muscleGroupsFor(exercise: PublicExercise): string {
    return (exercise?.muscleGroups ?? []).map(m => m.name).join(' · ');
  }
}
