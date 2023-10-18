import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Trainers } from 'src/app/models/trainers.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.css']
})
export class TrainerComponent {
  trainersData: Trainers[] = [];
  totalTrainers: number = 0;
  trainersLength: number = 0;
  searchComponent: string = 'trainer'
  isSearch: boolean = true;

  constructor(private ngxService: NgxUiLoaderService,
    public trainerStateService: TrainerStateService) {
  }

  ngOnInit(): void {
    this.trainerStateService.allTrainersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.trainersData = cachedData;
        this.totalTrainers = cachedData.length
        this.trainersLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.trainerStateService.getAllTrainers().subscribe((allTrainers) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.trainersData = allTrainers;
      this.totalTrainers = allTrainers.length
      this.trainersLength = allTrainers.length
      this.trainerStateService.setAllTrainersSubject(this.trainersData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Trainers[]): void {
    this.trainersData = results;
    this.totalTrainers = results.length;
  }

}


