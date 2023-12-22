import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Tasks } from 'src/app/models/tasks.interface';
import { TaskStateService } from 'src/app/services/task-state.service';

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

  constructor(private ngxService: NgxUiLoaderService,
    public taskStateService: TaskStateService) {
  }

  ngOnInit(): void {
    this.taskStateService.allTasksData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.tasksData = cachedData;
        this.totalTasks = cachedData.length
        this.tasksLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.taskStateService.getAllTasks().subscribe((allTasks) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.tasksData = allTasks;
      this.totalTasks = allTasks.length
      this.tasksLength = allTasks.length
      this.taskStateService.setAllTasksSubject(this.tasksData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Tasks[]): void {
    this.tasksData = results;
    this.totalTasks = results.length;
  }

}
