import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SubTasks } from 'src/app/models/tasks.interface';
import { loadSubTasks } from 'src/app/state/task/task.actions';
import { selectSubTasks } from 'src/app/state/task/task.selectors';

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
    this.store.dispatch(loadSubTasks());
    this.subscriptions.push(
      this.store.select(selectSubTasks).subscribe((subTasks) => {
        this.subTasksData = subTasks;
        this.totalSubTasks = subTasks.length
        this.subTasksLength = subTasks.length
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: SubTasks[]): void {
    this.subTasksData = results;
    this.totalSubTasks = results.length;
  }
}
