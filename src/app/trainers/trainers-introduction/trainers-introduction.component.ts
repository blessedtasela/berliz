import { Component, Input } from '@angular/core';
import { TrainerIntrodution } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainers-introduction',
  templateUrl: './trainers-introduction.component.html',
  styleUrls: ['./trainers-introduction.component.css']
})
export class TrainersIntroductionComponent {
  @Input() trainerIntroduction: TrainerIntrodution | any;
}
