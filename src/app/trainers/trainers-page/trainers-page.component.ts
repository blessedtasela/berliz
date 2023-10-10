import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Trainers } from 'src/app/models/trainers.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
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

  constructor(private trainerStateService: TrainerStateService,
    private ngxService: NgxUiLoaderService) { }

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
      this.ngxService.start()
      console.log('isCachedData false')
      this.trainers = activeTrainers;
      this.trainerStateService.setActiveTrainersSubject(this.trainers);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Trainers[]): void {
    this.trainers = results;
    this.countResult = results.length;
  }


}
