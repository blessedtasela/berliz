import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Tasks } from 'src/app/models/tasks.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { TaskService } from 'src/app/services/task.service';
import { TaskStateService } from 'src/app/services/task-state.service';
import { UpdateTasksModalComponent } from '../update-tasks-modal/update-tasks-modal.component';
import { TaskDetailsModalComponent } from '../task-details-modal/task-details-modal.component';

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.css']
})
export class TasksListComponent {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() tasksData: Tasks[] = [];
  @Input() totalTasks: number = 0;

  constructor(private datePipe: DatePipe,
    private taskService: TaskService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    private taskStateService: TaskStateService) {
  }

  ngOnInit() {
    this.watchGetCategoryFromMap()
    this.watchLikeCategory()
    this.watchUpdateCategory()
    this.watchUpdateStatus()
    this.watchDeleteCategory()
  }

  handleEmitEvent() {
    this.taskStateService.getAllTasks().subscribe((allTasks) => {
      this.ngxService.start()
      this.tasksData = allTasks;
      this.totalTasks = this.tasksData.length
      this.taskStateService.setAllTasksSubject(this.tasksData);
      this.ngxService.stop()
    });
  }

  openUpdateTask(id: number) {
    try {
      const task = this.tasksData.find(task => task.id === id);
      if (task) {
        const dialogRef = this.dialog.open(UpdateTasksModalComponent, {
          width: '900px',
          maxHeight: '600px',
          disableClose: true,
          data: {
            taskData: task,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateTasksModalComponent;
        childComponentInstance.onUpdateTaskEmit.subscribe(() => {
          this.handleEmitEvent()
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without adding a task');
            }
          });
        });
      } else {
        this.snackbarService.openSnackBar('task not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check task status", 'error');
    }
  }

  openTaskDetails(id: number) {
    try {
      const task = this.tasksData.find(task => task.id === id);
      if (task) {
        const dialogRef = this.dialog.open(TaskDetailsModalComponent, {
          width: '800px',
          panelClass: 'mat-dialog-height',
          data: {
            taskData: task,
          }
        });
      } else {
        this.snackbarService.openSnackBar('task not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check task status", 'error');
    }
  }

  updateTaskStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const task = this.tasksData.find(task => task.id === id);
    const message = task?.status === 'false'
      ? 'activate this task?'
      : 'deactivate this task?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.taskService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('task status updated successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without updating task status');
            }
          })
        })
    }, (error) => {
      this.ngxService.stop();
      this.snackbarService.openSnackBar(error, 'error');
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, 'error');
    });
  }

  deleteTask(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this task? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.taskService.deleteTask(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('task deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting task');
            }
          })
        })
    }, (error) => {
      this.ngxService.stop();
      this.snackbarService.openSnackBar(error, 'error');
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, 'error');
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchLikeCategory() {
    this.rxStompService.watch('/topic/likeCategory').subscribe((message) => {
      const receivedCategories: Tasks = JSON.parse(message.body);
      const categoryId = this.tasksData.findIndex(task => task.id === receivedCategories.id)
      this.tasksData[categoryId] = receivedCategories
    });
  }

  watchUpdateCategory() {
    this.rxStompService.watch('/topic/updateCategory').subscribe((message) => {
      const receivedCategories: Tasks = JSON.parse(message.body);
      const categoryId = this.tasksData.findIndex(task => task.id === receivedCategories.id)
      this.tasksData[categoryId] = receivedCategories
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      const receivedCategories: Tasks = JSON.parse(message.body);
      this.tasksData.push(receivedCategories);
    });
  }

  watchUpdateStatus() {
    this.rxStompService.watch('/topic/updateCategoryStatus').subscribe((message) => {
      const receivedCategories: Tasks = JSON.parse(message.body);
      const categoryId = this.tasksData.findIndex(task => task.id === receivedCategories.id)
      this.tasksData[categoryId] = receivedCategories
    });
  }

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCategory').subscribe((message) => {
      const receivedCategories: Tasks = JSON.parse(message.body);
      this.tasksData = this.tasksData.filter(task => task.id !== receivedCategories.id);
    });
  }

}

