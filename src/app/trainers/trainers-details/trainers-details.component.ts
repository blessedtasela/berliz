import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainerAlbum, TrainerBenefits, TrainerCategory, TrainerClientReview, TrainerFeatureVideo, TrainerHeroAlbum, TrainerIntrodution, TrainerStatistics, TrainerSubscriptionForm } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainers-details',
  templateUrl: './trainers-details.component.html',
  styleUrls: ['./trainers-details.component.css']
})
export class TrainersDetailsComponent {
  trainerId: number = 0;
  trainerHeroAlbum: TrainerHeroAlbum | undefined;
  trainerStats: TrainerStatistics | undefined;
  trainerCategory: TrainerCategory | undefined;
  trainerVideo: TrainerFeatureVideo | undefined;
  trainerBenefits: TrainerBenefits | undefined;
  trainerReview: TrainerClientReview | undefined;
  trainerSubscription: TrainerSubscriptionForm | undefined;
  trainerPhotoAlbum: TrainerAlbum | undefined;
  trainerIntroduction: TrainerIntrodution | undefined;
  trainerwhatsapp: TrainerSubscriptionForm | undefined;
  
 
}
