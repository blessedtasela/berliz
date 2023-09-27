import { Component, Input } from '@angular/core';
import { TrainerIntrodution } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainer-introduction',
  templateUrl: './trainer-introduction.component.html',
  styleUrls: ['./trainer-introduction.component.css']
})
export class TrainerIntroductionComponent {
  @Input() trainerIntroduction: TrainerIntrodution | undefined;
}
