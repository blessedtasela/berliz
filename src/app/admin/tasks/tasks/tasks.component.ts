import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Tasks } from 'src/app/models/tasks.interface';
import { loadTasks } from 'src/app/state/task/task.actions';
import { selectTasks } from 'src/app/state/task/task.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent {
  tasksData: Tasks[] = [];
  totalTasks: number = 0;
  tasksLength: number = 0;
  searchComponent: string = 'task'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  readonly selectTasks = selectTasks;
  readonly taskSearchFields: AdminSearchField<Tasks>[] = [
    { value: 'user', label: 'Client', accessor: t => `${t.userFirstname || ''} ${t.userLastname || ''} ${t.userEmail || ''}` },
    { value: 'trainer', label: 'Trainer', accessor: t => t.trainerName },
    { value: 'description', label: 'Description', accessor: t => t.description },
    { value: 'priority', label: 'Priority', accessor: t => t.priority },
    { value: 'status', label: 'Status', accessor: t => t.status },
    { value: 'id', label: 'Task id', accessor: t => t.id?.toString() },
  ];

  constructor(private ngxService: NgxUiLoaderService,
    private store: Store) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadTasks());
    this.subscriptions.push(
      this.store.select(selectTasks).subscribe((allTasks) => {
        this.tasksData = allTasks;
        this.totalTasks = allTasks.length
        this.tasksLength = allTasks.length
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: Tasks[]): void {
    this.tasksData = results;
    this.totalTasks = results.length;
  }
}
