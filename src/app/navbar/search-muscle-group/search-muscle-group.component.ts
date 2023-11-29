import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { MuscleGroupStateService } from 'src/app/services/muscle-group-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-search-muscle-group',
  templateUrl: './search-muscle-group.component.html',
  styleUrls: ['./search-muscle-group.component.css']
})
export class SearchMuscleGroupComponent {
  muscleGroupsData: MuscleGroups[] = [];
  filteredMuscleGroupsData: MuscleGroups[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<MuscleGroups[]> = new EventEmitter<MuscleGroups[]>()


  constructor(private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef,
    public muscleGroupStateService: MuscleGroupStateService) {
  }

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
          return this.search(query);
        })
      )
      .subscribe(
        (results: MuscleGroups[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  search(query: string): Observable<MuscleGroups[]> {
    this.muscleGroupStateService.allMuscleGroupData$.subscribe((cachedData) => {
      this.muscleGroupsData = cachedData;
    });
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredMuscleGroupsData = this.muscleGroupsData;
    }
    this.filteredMuscleGroupsData = this.muscleGroupsData.filter((muscleGroup: MuscleGroups) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return muscleGroup.name && muscleGroup.name.toLowerCase().includes(query);
          case 'bodyPart':
            return muscleGroup.bodyPart && muscleGroup.bodyPart.toLowerCase().includes(query);
        case 'id':
          return muscleGroup.id && muscleGroup.id.toString().includes(query);
        case 'description':
          return muscleGroup.description && muscleGroup.description.toLowerCase().includes(query);
        case 'status':
          return muscleGroup.status && muscleGroup.status.toLowerCase().includes(query);
        case 'exercise':
          return (
            muscleGroup.exercise.length > 0 &&
            muscleGroup.exercise.some((exercise) => exercise.name.toLowerCase().includes(query))
          );
        default:
          return false;
      }
    });
    return of(this.filteredMuscleGroupsData);
  }

  onSearchCriteriaChange(event: any): void {
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
  }

}

