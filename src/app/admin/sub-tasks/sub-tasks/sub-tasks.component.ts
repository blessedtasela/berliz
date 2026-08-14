import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { SubTasks } from 'src/app/models/tasks.interface';
import { loadSubTasks } from 'src/app/state/task/task.actions';
import { selectSubTasks } from 'src/app/state/task/task.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
  selector: 'app-sub-tasks',
  templateUrl: './sub-tasks.component.html',
  styleUrls: ['./sub-tasks.component.css']
})
export class SubTasksComponent {
  subTasksData: SubTasks[] = [];
  totalSubTasks: number = 0;
  subTasksLength: number = 0;
  searchComponent: string = 'sub-task'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  readonly selectSubTasks = selectSubTasks;
  readonly subTaskSearchFields: AdminSearchField<SubTasks>[] = [
    { value: 'name', label: 'Name', accessor: s => s.name },
    { value: 'exercise', label: 'Exercise', accessor: s => s.exerciseName },
    { value: 'id', label: 'Sub-task id', accessor: s => s.id?.toString() },
  ];

  constructor(private store: Store) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.store.dispatch(loadSubTasks());
    this.subscriptions.push(
      this.store.select(selectSubTasks).subscribe((subTasks) => {
        this.subTasksData = subTasks;
        this.totalSubTasks = subTasks.length
        this.subTasksLength = subTasks.length
      })
    );
  }

  handleSearchResults(results: SubTasks[]): void {
    this.subTasksData = results;
    this.totalSubTasks = results.length;
  }
}
