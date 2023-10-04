import { Component } from '@angular/core';
import { Trainers } from 'src/app/models/trainers.interface';
import { TrainerDataService } from 'src/app/services/trainer-data.service';
import { TrainerService } from 'src/app/services/trainer.service';

@Component({
  selector: 'app-trainers-page',
  templateUrl: './trainers-page.component.html',
  styleUrls: ['./trainers-page.component.css']
})
export class TrainersPageComponent {
  trainers: Trainers[] = [];
  countResult: number = 0;
  allTrainers: Trainers[] = [];

  constructor(private trainerDataService: TrainerDataService,
    private trainerService: TrainerService,) { }

  ngOnInit(): void {
    this.handleEmitEvent()
    this.triggerEmitEvent()
  }

  handleEmitEvent() {
    this.trainerDataService.getActiveTrainers().subscribe(() => {
      this.trainers = this.trainerDataService.activeTrainers
    });
  }

  triggerEmitEvent() {
    this.trainerService.trainerEventEmitter.subscribe(() => {
      this.handleEmitEvent();
    })
  }

  handleSearchResults(results: Trainers[]): void {
    this.trainers = results;
    this.countResult = results.length;
  }

}
