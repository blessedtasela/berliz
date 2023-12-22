import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { SubTasks } from 'src/app/models/tasks.interface';
import { TaskStateService } from 'src/app/services/task-state.service';

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

  constructor(private ngxService: NgxUiLoaderService,
    public taskStateService: TaskStateService) {
  }

  ngOnInit(): void {
    this.taskStateService.subTasksData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.subTasksData = cachedData;
        this.totalSubTasks = cachedData.length
        this.subTasksLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.taskStateService.getSubTasks().subscribe((subTasks) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.subTasksData = subTasks;
      this.totalSubTasks = subTasks.length
      this.subTasksLength = subTasks.length
      this.taskStateService.setSubTasksSubject(this.subTasksData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: SubTasks[]): void {
    this.subTasksData = results;
    this.totalSubTasks = results.length;
  }

}
