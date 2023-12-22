import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { SubTasks } from 'src/app/models/tasks.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TaskStateService } from 'src/app/services/task-state.service';

@Component({
  selector: 'app-search-sub-task',
  templateUrl: './search-sub-task.component.html',
  styleUrls: ['./search-sub-task.component.css']
})
export class SearchSubTaskComponent {
  subTasksData: SubTasks[] = [];
  filteredCentersData: SubTasks[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<SubTasks[]> = new EventEmitter<SubTasks[]>()
  subscriptions: Subscription[] = []

  constructor(private taskStateService: TaskStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
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
        (results: SubTasks[]) => {
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

  search(query: string): Observable<SubTasks[]> {
    this.subscriptions.push(
      this.taskStateService.subTasksData$.subscribe((cachedData => {
        this.subTasksData = cachedData
      }))
    )
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredCentersData = this.subTasksData;
    }
    this.filteredCentersData = this.subTasksData.filter((subTask: SubTasks) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return subTask.name.toLowerCase().includes(query);
        case 'trainer':
          return subTask.task.trainer.name.toLowerCase().includes(query);
        case 'email':
          return subTask.task.user.email.toLowerCase().includes(query);
        case 'exercise':
          return subTask.exercise.name.toLowerCase().includes(query);
        case 'id':
          return subTask.id.toString().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredCentersData);
  }

}

