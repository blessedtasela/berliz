import { DatePipe } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { Trainers } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainers-search-result',
  templateUrl: './trainers-search-result.component.html',
  styleUrls: ['./trainers-search-result.component.css']
})
export class TrainersSearchResultComponent {
  @Input() trainersResult: Trainers[] = [];
  showFullData: boolean = false;
  @Input() totalTrainers: number = 0;

  constructor(private datePipe: DatePipe) { }

  ngOnInit(): void {
 
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  formatStringtoUrl(string: any) {
    return string.replace(/ /g, "-");
  }
}