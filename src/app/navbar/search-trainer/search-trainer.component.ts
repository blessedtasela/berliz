import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';

@Component({
  selector: 'app-search-trainer',
  templateUrl: './search-trainer.component.html',
  styleUrls: ['./search-trainer.component.css']
})
export class SearchTrainerComponent implements OnInit, AfterViewInit {
  trainersData: Trainers[] = [];
  filteredTrainersData: Trainers[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<Trainers[]> = new EventEmitter<Trainers[]>()

  constructor(private trainerStateService: TrainerStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap(() => {
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query); // Perform the search with the query
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

  // Function to handle the search select change event
  onSearchCriteriaChange(event: any): void {
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
  }

  search(query: string): Observable<Trainers[]> {
    this.trainerStateService.allTrainersData$.subscribe((cachedData => {
      this.trainersData = cachedData
    }))
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredTrainersData = this.trainersData;
    }
    this.filteredTrainersData = this.trainersData.filter((trainer: Trainers) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return trainer.name.toLowerCase().includes(query);
        case 'address':
          return trainer.address.toLowerCase().includes(query);
        case 'motto':
          return trainer.motto.toLowerCase().includes(query);
        case 'id':
          return trainer.id.toString().includes(query);
        case 'email':
          return trainer.id.toString().includes(query);
        case 'userId':
          return trainer.partner.user.id.toString().includes(query);
        case 'partnerId':
          return trainer.partner.id.toString().includes(query);
        case 'status':
          return trainer.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredTrainersData);
  }

}

