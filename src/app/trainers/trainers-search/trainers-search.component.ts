import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of, Subscription } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

@Component({
  selector: 'app-trainers-search',
  templateUrl: './trainers-search.component.html',
  styleUrls: ['./trainers-search.component.css']
})
export class TrainersSearchComponent {
  @Input() trainers: Trainers[] = [];
  @Output() allTrainers: EventEmitter<Trainers[]> = new EventEmitter<Trainers[]>();

  activeTrainers: Trainers[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: string = 'name';

  private trainerSub?: Subscription;

  constructor(
    private trainerStateService: TrainerStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef,
    private rxStompService: RxStompService
  ) { }

  ngOnInit(): void {
    this.trainerSub = this.trainerStateService.activeTrainersData$
      .subscribe((data: Trainers[] | null) => {
        if (!data) {
          this.activeTrainers = [];
          this.trainers = [];
          this.allTrainers.emit([]);
          return;
        }

        this.activeTrainers = [...data];
        this.trainers = [...data];
        this.allTrainers.emit(this.trainers);
      });


    this.watchUpdateTrainerStatus();
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  initializeSearch(): void {
    const input = this.elementRef.nativeElement.querySelector('input');
    if (!input) return;

    fromEvent(input, 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap((query: string) => {
          this.searchQuery = query;
          this.ngxService.start();
        }),
        switchMap((query: string) => this.search(query))
      )
      .subscribe({
        next: (results: Trainers[]) => {
          this.ngxService.stop();
          this.allTrainers.emit(results);
        },
        error: () => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar('Search failed.', 'error');
        }
      });
  }

  search(query: string): Observable<Trainers[]> {
    const lowerQuery = query.trim().toLowerCase();

    if (!lowerQuery) {
      return of(this.activeTrainers);
    }

    const filtered = this.activeTrainers.filter((trainer: Trainers) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return trainer.name?.toLowerCase().includes(lowerQuery);
        case 'category':
          return trainer.categories?.some(cat =>
            cat.name?.toLowerCase().includes(lowerQuery)
          );
        case 'address':
          return trainer.address?.toLowerCase().includes(lowerQuery);
        default:
          return false;
      }
    });

    return of(filtered);
  }

  searchByButton(): void {
    const query = this.searchQuery?.trim();
    if (!query) {
      this.snackbarService.openSnackBar('Please enter a search term.', 'error');
      return;
    }

    this.ngxService.start();

    this.search(query).subscribe({
      next: (results) => {
        this.allTrainers.emit(results);
        this.ngxService.stop();
      },
      error: () => {
        this.ngxService.stop();
        this.snackbarService.openSnackBar('Search failed.', 'error');
      }
    });
  }

  onSearchCriteriaChange(): void {
    this.searchByButton();
  }

  watchUpdateTrainerStatus(): void {
    this.rxStompService.watch('/topic/updateTrainerStatus')
      .subscribe((message) => {
        const receivedTrainer: Trainers = JSON.parse(message.body);

        if (receivedTrainer.status === 'false') {
          this.trainers = [...this.trainers, receivedTrainer];
        } else {
          this.trainers = this.trainers.filter(t => t.id !== receivedTrainer.id);
        }

        this.activeTrainers = [...this.trainers];
        this.allTrainers.emit(this.trainers);
      });
  }

  ngOnDestroy(): void {
    this.trainerSub?.unsubscribe();
  }
}