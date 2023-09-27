import { Component, Input, SimpleChanges } from '@angular/core';
import { Trainers } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainers-search-result',
  templateUrl: './trainers-search-result.component.html',
  styleUrls: ['./trainers-search-result.component.css']
})
export class TrainersSearchResultComponent {
  @Input() countResult: number = 0;
  showAllTrainers: boolean = false;
  @Input() searchResult: Trainers[] = [];
  filteredTrainers: Trainers[] = [];

  constructor() {}
  
  allTrainers() {
    this.showAllTrainers = !this.showAllTrainers;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('results' in changes) {
      this.filteredTrainers = changes['results'].currentValue;
    }
  }

}
