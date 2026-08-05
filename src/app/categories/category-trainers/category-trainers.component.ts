import { Component, Input } from '@angular/core';
import { Trainers } from 'src/app/models/trainers.interface';
import { environment } from 'src/environments/environment';

/**
 * "Trainers who train this discipline" — DERIVED client-side from
 * `Trainer.categories`. There is no per-category trainer endpoint.
 */
@Component({
  selector: 'app-category-trainers',
  templateUrl: './category-trainers.component.html',
  styleUrls: ['./category-trainers.component.css']
})
export class CategoryTrainersComponent {
  @Input() trainers: Trainers[] = [];
  @Input() categoryName = '';

  readonly strapiUrl = environment.strapiUrl;

  photoUrl(trainer: Trainers): string {
    const url = trainer?.photoResponse?.photoUrl;
    return url ? this.strapiUrl + url : 'assets/avatar.png';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }

  formatUrl(name: string): string {
    return name?.replace(/ /g, '-') ?? '';
  }
}
