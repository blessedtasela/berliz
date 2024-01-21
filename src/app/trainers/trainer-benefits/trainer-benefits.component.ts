import { Component, Input } from '@angular/core';
import { TrainerPhotoAlbum, TrainerBenefits, TrainerHeroAlbum } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainer-benefits',
  templateUrl: './trainer-benefits.component.html',
  styleUrls: ['./trainer-benefits.component.css']
})
export class TrainerBenefitsComponent {
 @Input() trainerBenefit: TrainerBenefits | any;
 @Input() album: TrainerHeroAlbum | any;

  constructor() {
  }
  
}
