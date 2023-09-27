import { Component } from '@angular/core';
import { Trainers } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainers-page',
  templateUrl: './trainers-page.component.html',
  styleUrls: ['./trainers-page.component.css']
})
export class TrainersPageComponent {
  showResults: boolean = false;
  trainerList: Trainers [] = [];
  countResult: number = 0;

  constructor() {  }

  updateSearchResults(results: Trainers[]): void {
    this.trainerList = results;
    this.showResults = true;
  }
}
