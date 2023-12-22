import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Tasks } from 'src/app/models/tasks.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TaskStateService } from 'src/app/services/task-state.service';
import { AddTasksModalComponent } from '../add-tasks-modal/add-tasks-modal.component';

@Component({
  selector: 'app-tasks-header',
  templateUrl: './tasks-header.component.html',
  styleUrls: ['./tasks-header.component.css']
})
export class TasksHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() tasksData: Tasks[] = [];
  @Input() totalTasks: number = 0;
  @Input() tasksLength: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private taskStateService: TaskStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
  }

  handleEmitEvent() {
    this.taskStateService.getAllTasks().subscribe((allTasks) => {
      this.ngxService.start()
      console.log('cached false')
      this.tasksData = allTasks;
      this.totalTasks = this.tasksData.length
      this.tasksLength = this.tasksData.length
      this.taskStateService.setAllTasksSubject(this.tasksData);
      this.ngxService.stop()
    });
  }

  sortTasksData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.tasksData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'email':
        this.tasksData.sort((a, b) => {
          return a.user.email.localeCompare(b.user.email);
        });
        break;
      case 'id':
        this.tasksData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'subTask':
        this.tasksData.sort((a, b) => {
          const nameA = a.subTasks[0].name.toLowerCase();
          const nameB = b.subTasks[0].name.toLowerCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        break;
      case 'lastUpdate':
        this.tasksData.sort((a, b) => {
          const dateA = new Date(a.lastUpdate);
          const dateB = new Date(b.lastUpdate);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      default:
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortTasksData();
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddTask() {
    const dialogRef = this.dialog.open(AddTasksModalComponent, {
      width: '800px',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddTasksModalComponent;
    childComponentInstance.onAddTaskEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a category');
      }
    });
  }

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCenter').subscribe((message) => {
      const receivedCategories: Tasks = JSON.parse(message.body);
      this.tasksData = this.tasksData.filter(category => category.id !== receivedCategories.id);
      this.tasksLength = this.tasksData.length;
      this.totalTasks = this.tasksData.length
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      const receivedCategories: Tasks = JSON.parse(message.body);
      this.tasksData.push(receivedCategories);
      this.tasksLength = this.tasksData.length;
      this.totalTasks = this.tasksData.length
    });
  }
}
