import { Component, Input } from '@angular/core';
import { TrainerFeatureVideo } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainer-feature-video',
  templateUrl: './trainer-feature-video.component.html',
  styleUrls: ['./trainer-feature-video.component.css']
})
export class TrainerFeatureVideoComponent {
 @Input() trainerVideos: TrainerFeatureVideo | undefined;

  constructor(){

  }
  
}
