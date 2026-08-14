import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Tasks } from 'src/app/models/tasks.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AddTasksModalComponent } from '../add-tasks-modal/add-tasks-modal.component';
import { loadTasks } from 'src/app/state/task/task.actions';
import { selectTasks } from 'src/app/state/task/task.selectors';

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
  subscriptions: Subscription[] = [];

  constructor(private dialog: MatDialog,
    private store: Store,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.store.dispatch(loadTasks());
    this.subscriptions.push(
      this.store.select(selectTasks).subscribe((allTasks) => {
        this.tasksData = allTasks;
        this.totalTasks = this.tasksData.length
        this.tasksLength = this.tasksData.length
      })
    );
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
          return a.userEmail.localeCompare(b.userEmail);
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
      width: '720px',
      maxWidth: '95vw',
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
