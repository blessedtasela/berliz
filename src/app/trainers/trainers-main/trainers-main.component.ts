import { Component } from '@angular/core';
import { Trainers } from 'src/app/models/trainers.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

@Component({
  selector: 'app-trainers-main',
  templateUrl: './trainers-main.component.html',
  styleUrls: ['./trainers-main.component.css']
})
export class TrainersMainComponent {
 trainers: Trainers[] = [];
  countResult: number = 0;
  allTrainers: Trainers[] = [];

  constructor(private trainerStateService: TrainerStateService) { }

  ngOnInit(): void {
    this.trainerStateService.activeTrainersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.trainers = cachedData;
      }
    });
  }

  handleEmitEvent() {
    this.trainerStateService.getActiveTrainers().subscribe((activeTrainers) => {
      console.log('isCachedData false')
      this.trainers = activeTrainers;
      this.trainerStateService.setActiveTrainersSubject(this.trainers);
    });
  }

  handleSearchResults(results: Trainers[]): void {
    this.trainers = results;
    this.countResult = results.length;
  }

}
