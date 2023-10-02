import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter } from '@angular/core';
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
  trainers: Trainers[] = [];
  showFullData: boolean = false;
  invalidForm: boolean = false;
  selectedSortOption: string = 'date';
  filteredTrainersData: Trainers[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  counter: number = 0;
  totalTrainers: number = 0;
  results: EventEmitter<Trainers[]> = new EventEmitter<Trainers[]>()

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
        this.filteredTrainersData = this.trainers
        this.counter = this.trainers.length
        this.totalTrainers = this.trainers.length
        this.sortTrainersData();
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
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }



  sortTrainersData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.filteredTrainersData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();

        });
        break;

      case 'name':
        this.filteredTrainersData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;

      case 'likes':
        this.filteredTrainersData.sort((a, b) => {
          return b.likes - a.likes;
        });
        break;

      case 'categories':
        this.filteredTrainersData.sort((a, b) => {
          const nameA = a.categorySet[0].name.toLowerCase();
          const nameB = b.categorySet[0].name.toLowerCase();

          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        break;

      default:
      
    }
  }

  // Function to handle the sort select change event
  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortTrainersData();
  }

  // Function to handle the search select change event
  onSearchCriteriaChange(event: any): void {
    this.ngxService.start();
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
    this.ngxService.stop()
  }

  search(query: string): Observable<Trainers[]> {
    query = query.toLowerCase();
    if (query.trim() === '') {
      // If the query is empty, return the original data
      this.filteredTrainersData = this.trainers;
      this.counter = this.filteredTrainersData.length;
      return of(this.filteredTrainersData);
    }

    // Filter your data based on the selected criteria and search query
    this.filteredTrainersData = this.trainers.filter((trainer: Trainers) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return trainer.name.toLowerCase().includes(query);
        case 'category':
          return trainer.categorySet.some(category => category.name.toLowerCase().includes(query));
        case 'address':
          return trainer.address.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    this.counter = this.filteredTrainersData.length;
    return of(this.filteredTrainersData);
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