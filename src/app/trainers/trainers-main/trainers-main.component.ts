import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Trainers } from 'src/app/models/trainers.interface';
import { selectCurrentTrainer, selectTrainers } from 'src/app/state/trainer/trainer.selector';

@Component({
  selector: 'app-trainers-main',
  templateUrl: './trainers-main.component.html',
  styleUrls: ['./trainers-main.component.css']
})
export class TrainersMainComponent {
  trainers: Trainers[] = [];
  countResult: number = 0;
  allTrainers: Trainers[] = [];
  showPartnerForm = false;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.select(selectTrainers).subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.trainers = cachedData;
      }
    });
  }

  handleEmitEvent() {
    this.store.select(selectTrainers).subscribe((cachedData) => {
      this.trainers = cachedData;
    });
  }

  handleSearchResults(results: Trainers[]): void {
    this.trainers = results;
    this.countResult = results.length;
  }

}
