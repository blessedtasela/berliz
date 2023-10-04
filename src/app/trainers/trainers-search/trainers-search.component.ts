import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerDataService } from 'src/app/services/trainer-data.service';
import { TrainerService } from 'src/app/services/trainer.service';

@Component({
  selector: 'app-trainers-search',
  templateUrl: './trainers-search.component.html',
  styleUrls: ['./trainers-search.component.css']
})
export class TrainersSearchComponent {
  trainers: Trainers[] = [];
  activeTrainers: Trainers[] = [];
  @Output() allTrainers: EventEmitter<Trainers[]> = new EventEmitter<Trainers[]>();
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';

  constructor(private datePipe: DatePipe,
    private trainerDataService: TrainerDataService,
    private trainerService: TrainerService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) { }

  ngOnInit(): void {
    this.handleEmitEvent()
    this.triggerEmitEvent()
  }

  handleEmitEvent() {
    this.trainerDataService.getActiveTrainers().subscribe(() => {
      this.initializeSearch();
      this.trainers = this.trainerDataService.activeTrainers
      this.activeTrainers = this.trainers
      this.allTrainers.emit(this.trainers);
    });
  }

  triggerEmitEvent() {
    this.trainerService.trainerEventEmitter.subscribe(() => {
      this.handleEmitEvent();
    })
  }

  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap((query: string) => {
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query);
        })
      )
      .subscribe(
        (results: Trainers[]) => {
          this.ngxService.stop();
          this.allTrainers.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  onSearchCriteriaChange(event: any): void {
    this.ngxService.start();
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
    this.ngxService.stop()
  }

  search(query: string): Observable<Trainers[]> {
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.trainers = this.activeTrainers;
    }
    this.trainers = this.activeTrainers.filter((trainer: Trainers) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return trainer.name.toLowerCase().includes(query);
        case 'category':
          return trainer.categorySet.some(category => category.name.toLowerCase().includes(query));
        case 'address':
          return trainer.address.toLowerCase().includes(query);
        default:
          return this.activeTrainers;
      }
    });
    return of(this.trainers);
  }

}
