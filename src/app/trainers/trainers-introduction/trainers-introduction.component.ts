import { Component, Input } from '@angular/core';
import { TrainerIntroduction } from 'src/app/models/trainers.interface';
import { environment } from 'src/environments/environment';

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

  readonly strapiUrl = environment.strapiUrl;

  get photoUrl(): string {
    const url = this.trainerIntroduction?.photo?.photoUrl;
    if (!url) return 'assets/avatar.png';
    return url.startsWith('http') ? url : `${this.strapiUrl}${url}`;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }
}
