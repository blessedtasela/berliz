import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerDataService } from 'src/app/services/trainer-data.service';
import { TrainerService } from 'src/app/services/trainer.service';

@Component({
  selector: 'app-trainers-list',
  templateUrl: './trainers-list.component.html',
  styleUrls: ['./trainers-list.component.css']
})
export class TrainersListComponent {
  @Input() trainersResult: Trainers[] = [];
  showFullData: boolean = false;
  @Input()filteredTrainersData: Trainers[] = [];
  @Input()counter: number = 0;
  @Input()totalTrainers: number = 0;

  constructor(private datePipe: DatePipe,
    private trainerDataService: TrainerDataService,
    private trainerService: TrainerService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) { }

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