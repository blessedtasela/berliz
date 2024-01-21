import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {TrainerReview, TrainerPhotoAlbum, TrainerBenefits, TrainerCategory, TrainerFeatureVideo, TrainerHeroAlbum, TrainerIntrodution, TrainerStatistics, TrainerSubscriptionForm } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainers-details',
  templateUrl: './trainers-details.component.html',
  styleUrls: ['./trainers-details.component.css']
})
export class TrainersDetailsComponent {
  trainerId: number = 0;
  trainerHeroAlbum: TrainerHeroAlbum | any;
  trainerStats: TrainerStatistics | any;
  trainerCategory: TrainerCategory | any;
  trainerVideo: TrainerFeatureVideo | any;
  trainerBenefits: TrainerBenefits | any;
  trainerReview: TrainerReview | any;
  trainerSubscription: TrainerSubscriptionForm | any;
  trainerPhotoAlbum: TrainerPhotoAlbum | any;
  trainerIntroduction: TrainerIntrodution | any;
  trainerwhatsapp: TrainerSubscriptionForm | any;
  
 
}
