import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Trainers } from 'src/app/models/trainers.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

@Component({
  selector: 'app-trainers',
  templateUrl: './trainers.component.html',
  styleUrls: ['./trainers.component.css']
})
export class TrainersComponent {
  trainersData: Trainers[] = [];
  totalTrainers: number = 0;
  trainersLength: number = 0;
  searchComponent: string = 'trainer'
  isSearch: boolean = true;

  constructor(private ngxService: NgxUiLoaderService,
    public trainerStateService: TrainerStateService) {
  }

  ngOnInit(): void {
    this.ngxService.start()
    this.trainerStateService.allTrainersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.trainersData = cachedData;
        this.totalTrainers = cachedData.length
        this.trainersLength = cachedData.length
      }
    });
    this.ngxService.stop()
  }

  handleEmitEvent() {
    this.trainerStateService.getAllTrainers().subscribe((allTrainers) => {
      console.log('isCachedData false')
      this.trainersData = allTrainers;
      this.totalTrainers = allTrainers.length
      this.trainersLength = allTrainers.length
    });
  }

  handleSearchResults(results: Trainers[]): void {
    this.trainersData = results;
    this.totalTrainers = results.length;
  }

}


