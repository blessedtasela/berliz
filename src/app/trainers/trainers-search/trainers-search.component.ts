import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';

@Component({
  selector: 'app-trainers-search',
  templateUrl: './trainers-search.component.html',
  styleUrls: ['./trainers-search.component.css']
})
export class TrainersSearchComponent {
  @Input() trainers: Trainers[] = [];
  activeTrainers: Trainers[] = [];
  @Output() allTrainers: EventEmitter<Trainers[]> = new EventEmitter<Trainers[]>();
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';

  constructor(private trainerStateService: TrainerStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) { }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }
  
  handleEmitEvent() {
    this.trainerStateService.getActiveTrainers().subscribe((trainers) => {
      this.initializeSearch();
      this.trainers = trainers
      this.activeTrainers = this.trainers
    });
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
    this.trainerStateService.activeTrainersData$.subscribe((cachedData) => {
      this.activeTrainers = cachedData;
    });
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
