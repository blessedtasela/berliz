import { Actions } from '@ngrx/effects';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Tasks } from 'src/app/models/tasks.interface';
import { loadTasks, loadTasksFailure, loadTasksSuccess } from 'src/app/state/task/task.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectTasks } from 'src/app/state/task/task.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-tasks',
    templateUrl: './tasks.component.html',
    styleUrls: ['./tasks.component.css'],
    standalone: false
})
export class TasksComponent {
  tasksData: Tasks[] = [];
  totalTasks: number = 0;
  tasksLength: number = 0;
  searchComponent: string = 'task'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;

  readonly selectTasks = selectTasks;
  readonly taskSearchFields: AdminSearchField<Tasks>[] = [
    { value: 'user', label: 'Client', accessor: t => `${t.userFirstname || ''} ${t.userLastname || ''} ${t.userEmail || ''}` },
    { value: 'trainer', label: 'Trainer', accessor: t => t.trainerName },
    { value: 'description', label: 'Description', accessor: t => t.description },
    { value: 'priority', label: 'Priority', accessor: t => t.priority },
    { value: 'status', label: 'Status', accessor: t => t.status },
    { value: 'id', label: 'Task id', accessor: t => t.id?.toString() },
  ];

  constructor(private store: Store, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(watchLoadError(this.actions$, loadTasksFailure, [loadTasks, loadTasksSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadTasks());
    this.subscriptions.push(
      this.store.select(selectTasks).subscribe((allTasks) => {
        this.tasksData = allTasks;
        this.totalTasks = allTasks.length
        this.tasksLength = allTasks.length
      })
    );
  }

  handleSearchResults(results: Tasks[]): void {
    this.tasksData = results;
    this.totalTasks = results.length;
  }

  retryLoad(): void {
    this.store.dispatch(loadTasks());
  }
}
