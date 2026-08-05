import { Component, Input } from '@angular/core';

/**
 * Flattened view of a `CenterTrainers` affiliation enriched with the public
 * `Trainers` profile it points at. Built by CenterDetailComponent so this
 * component stays presentational.
 */
export interface CenterTrainerCard {
  id: number;
  trainerId: number;
  trainerName: string;
  slug: string;
  photoUrl: string;
  motto: string;
  experience: string;
  status: string;
  date: Date;
}

@Component({
  selector: 'app-center-trainers',
  templateUrl: './center-trainers.component.html',
  styleUrls: ['./center-trainers.component.css']
})
export class CenterTrainersComponent {
  @Input() centerTrainers: CenterTrainerCard[] = [];
  showAllTrainers: boolean = false;

  allTrainers(): void {
    this.showAllTrainers = !this.showAllTrainers;
  }
}
