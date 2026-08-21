import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { SubTasks } from 'src/app/models/tasks.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { TaskService } from 'src/app/services/task.service';
import { UpdateSubTasksModalComponent } from '../update-sub-tasks-modal/update-sub-tasks-modal.component';
import { SubTaskDetailsModalComponent } from '../sub-task-details-modal/sub-task-details-modal.component';
import { Store } from '@ngrx/store';
import { loadSubTasks } from 'src/app/state/task/task.actions';
import { selectSubTasks } from 'src/app/state/task/task.selectors';

@Component({
  selector: 'app-sub-tasks-list',
  templateUrl: './sub-tasks-list.component.html',
  styleUrls: ['./sub-tasks-list.component.css']
})
export class SubTasksListComponent implements OnDestroy {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() subTasksData: SubTasks[] = [];
  @Input() totalSubTasks: number = 0;

  private subscriptions: Subscription[] = [];

  constructor(private datePipe: DatePipe,
    private taskService: TaskService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    private store: Store,
    private router: Router) {
  }

  ngOnInit() {
    this.watchGetCategoryFromMap()
    this.watchLikeCategory()
    this.watchUpdateCategory()
    this.watchUpdateStatus()
    this.watchDeleteCategory()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent() {
    this.store.dispatch(loadSubTasks());
    this.store.select(selectSubTasks).subscribe((subTasks) => {
      this.subTasksData = subTasks;
      this.totalSubTasks = this.subTasksData.length
    });
  }


  openUpdateSubTask(id: number) {
    try {
      const subTask = this.subTasksData.find(subTask => subTask.id === id);
      if (subTask) {
        const dialogRef = this.dialog.open(UpdateSubTasksModalComponent, {
          width: '900px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          disableClose: true,
          data: {
            subTaskData: subTask,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateSubTasksModalComponent;
        childComponentInstance.onUpdateSubTaskEmit.subscribe(() => {
          this.handleEmitEvent()
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without adding a subTask');
            }
          });
        });
      } else {
        this.snackbarService.openSnackBar('subTask not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check subTask status", 'error');
    }
  }

  openSubTaskDetails(id: number) {
    this.router.navigate(['/dashboard/sub-tasks', id]);
  }

  deleteSubTask(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this subTask? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.taskService.deleteSubTask(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('subTask deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting subTask');
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
    this.subscriptions.push(
      this.rxStompService.watch('/topic/likeCategory').subscribe((message) => {
        const receivedCategories: SubTasks = JSON.parse(message.body);
        const categoryId = this.subTasksData.findIndex(subTask => subTask.id === receivedCategories.id)
        this.subTasksData[categoryId] = receivedCategories
      })
    );
  }

  watchUpdateCategory() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/updateCategory').subscribe((message) => {
        const receivedCategories: SubTasks = JSON.parse(message.body);
        const categoryId = this.subTasksData.findIndex(subTask => subTask.id === receivedCategories.id)
        this.subTasksData[categoryId] = receivedCategories
      })
    );
  }

  watchGetCategoryFromMap() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
        const receivedCategories: SubTasks = JSON.parse(message.body);
        this.subTasksData.push(receivedCategories);
      })
    );
  }

  watchUpdateStatus() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/updateCategoryStatus').subscribe((message) => {
        const receivedCategories: SubTasks = JSON.parse(message.body);
        const categoryId = this.subTasksData.findIndex(subTask => subTask.id === receivedCategories.id)
        this.subTasksData[categoryId] = receivedCategories
      })
    );
  }

  watchDeleteCategory() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/deleteCategory').subscribe((message) => {
        const receivedCategories: SubTasks = JSON.parse(message.body);
        this.subTasksData = this.subTasksData.filter(subTask => subTask.id !== receivedCategories.id);
      })
    );
  }

}

