import { Component, Input } from '@angular/core';
import { TrainerIntroduction } from 'src/app/models/trainers.interface';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

/**
 * Public read-only rendering of a trainer's introduction.
 * `TrainerIntroduction` = free-text `introduction` + a single cover `photo`.
 */
@Component({
  selector: 'app-trainers-introduction',
  templateUrl: './trainers-introduction.component.html',
  styleUrls: ['./trainers-introduction.component.css']
})
export class TrainersIntroductionComponent {

  @Input() trainerIntroduction: TrainerIntroduction | null = null;

  get photoUrl(): string {
    const url = this.trainerIntroduction?.photo?.photoUrl;
    return url ? resolveStrapiUrl(url) : 'assets/avatar.png';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }
}
