import { Component, Input } from '@angular/core';
import { Exercises } from 'src/app/models/exercise.interface';
import { memoizeMediaUriByKey } from 'src/app/shared/photo-lightbox/photo-data-uri';

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

  private _demoUri = memoizeMediaUriByKey('video/mp4');

  /** Stable data-URI for an exercise's base64 demo clip (rebuilt only when the payload changes). */
  demoSrc(exercise: Exercises): string | null {
    return this._demoUri(exercise.id, exercise.demo);
  }

  muscleGroupsFor(exercise: Exercises): string {
    return (exercise?.muscleGroups ?? []).map(m => m.name).join(' · ');
  }
}
