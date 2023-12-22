import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import {  NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Tasks } from 'src/app/models/tasks.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TaskStateService } from 'src/app/services/task-state.service';

@Component({
  selector: 'app-search-task',
  templateUrl: './search-task.component.html',
  styleUrls: ['./search-task.component.css']
})
export class SearchTaskComponent {
  tasksData: Tasks[] = [];
  filteredCentersData: Tasks[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'description';
  @Output() results: EventEmitter<Tasks[]> = new EventEmitter<Tasks[]>()
  subscriptions: Subscription [] = []

  constructor(private taskStateService: TaskStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub=>(sub.unsubscribe()))
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
        (results: Tasks[]) => {
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

  search(query: string): Observable<Tasks[]> {
    this.subscriptions.push(
      this.taskStateService.allTasksData$.subscribe((cachedData => {
      this.tasksData = cachedData
    }))
    )
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredCentersData = this.tasksData;
    }
    this.filteredCentersData = this.tasksData.filter((task: Tasks) => {
      switch (this.selectedSearchCriteria) {
        case 'email':
          return task.user.email.toLowerCase().includes(query);
        case 'trainer':
          return task.trainer.name.toLowerCase().includes(query);
          case 'description':
            return task.description.toLowerCase().includes(query);
        case 'priority':
          return task.priority.toLowerCase().includes(query);
        case 'id':
          return task.id.toString().includes(query);
        default:
          return false;
      }
    });
    return of(this.filteredCentersData);
  }

}

