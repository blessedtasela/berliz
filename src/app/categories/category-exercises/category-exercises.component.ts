import { Component, Input } from '@angular/core';
import { Exercises } from 'src/app/models/exercise.interface';

/**
 * "Exercises tagged with this discipline" — DERIVED client-side from
 * `Exercise.categories`. There is no per-category exercise endpoint.
 */
@Component({
  selector: 'app-category-exercises',
  templateUrl: './category-exercises.component.html',
  styleUrls: ['./category-exercises.component.css']
})
export class CategoryExercisesComponent {
  @Input() exercises: Exercises[] = [];
  @Input() categoryName = '';

  muscleGroupsFor(exercise: Exercises): string {
    return (exercise?.muscleGroups ?? []).map(m => m.name).join(' · ');
  }
}
