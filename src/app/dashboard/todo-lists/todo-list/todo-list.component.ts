import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { TodoList } from 'src/app/models/todoList.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoStateService } from 'src/app/services/todo-state.service';
import { TodoService } from 'src/app/services/todo.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { EditTodoComponent } from '../edit-todo/edit-todo.component';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent {
  @Input() todoData: TodoList[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  @Input() totalTodos: number = 0;
  @Input() todosLength: number = 0;
  subscriptions: Subscription[] = []
  @Output() emitEvent = new EventEmitter()
  isTaskCompleted: boolean[] = [];
  menuOpen: boolean[] = Array(this.todoData.length).fill(false);

  constructor(private todoStateService: TodoStateService,
    private todoService: TodoService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.subscribeToCloseTodoAction()
    this.isTaskCompleted = this.todoData.map(todo => todo.status === 'completed');
    this.watchDeleteCenter()
    this.watchGetCenterFromMap()
    this.watchLikeCenter()
    this.watchUpdateCenter()
    this.watchUpdateCenterStatus()
    this.watchUpdatePhoto()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.subscriptions.push(
      this.todoStateService.getMyTodos().subscribe((myTodo) => {
        this.todoData = myTodo;
        this.totalTodos = this.todoData.length;
        this.todoStateService.setmyTodosSubject(this.todoData);
      }),
    );
    this.ngxService.stop();
  }

  openMenu(index: number) {
    this.menuOpen[index] = !this.menuOpen[index];
  }

  subscribeToCloseTodoAction() {
    document.addEventListener('click', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeAllDropdowns();
      }
    });

  }

  isClickInsideDropdown(event: Event): any {
    const dropdownElement = document.getElementById('todoAction');
    return dropdownElement && dropdownElement.contains(event.target as Node);
  }

  closeAllDropdowns() {
    this.menuOpen = Array(this.todoData.length).fill(false);
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  onCheckboxChange(todo: TodoList) {
    const dialogConfig = new MatDialogConfig();
    if (todo.status === 'completed') {
      this.snackbarService.openSnackBar("Task is completed already", "")
      return;
    }
    dialogConfig.data = {
      message: 'Are you sure you want to mark this task as completed?',
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.todoService.updateStatus(todo.id, "completed").subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent();
          this.emitEvent.emit()
          dialogRef.close('task completed successfully');
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without completing task');
              this.isTaskCompleted[this.todoData.indexOf(todo)] = false;
            }
          });
        },
        (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        }
      );
    });
  }

  updateTodoStatus(id: number, status: string) {
    const dialogConfig = new MatDialogConfig();
    const todo = this.todoData.find((c) => c.id === id);
    if (todo) {
      var message: any;
      if (status === 'pending') {
        message = 'restart this task?';
      }
      if (status === 'in-progress') {
        message = 'begin this task?';
      }
      if (status === 'completed') {
        message = 'finish this task?';
      }
      dialogConfig.data = {
        message: message,
        confirmation: true,
        disableClose: true,
      };
      const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
      const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
        this.ngxService.start();
        this.todoService.updateStatus(id, status).subscribe(
          (response: any) => {
            this.ngxService.stop();
            this.responseMessage = response.message;
            this.snackbarService.openSnackBar(this.responseMessage, '');
            this.handleEmitEvent();
            this.emitEvent.emit()
            this.menuOpen = Array(this.todoData.length).fill(false);
            dialogRef.close('todo status updated successfully');
            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                console.log(`Dialog result: ${result}`);
              } else {
                console.log('Dialog closed without updating todo status');
              }
            });
          },
          (error) => {
            this.ngxService.stop();
            this.snackbarService.openSnackBar(error, 'error');
            if (error.error?.message) {
              this.responseMessage = error.error?.message;
            } else {
              this.responseMessage = genericError;
            }
            this.snackbarService.openSnackBar(this.responseMessage, 'error');
          }
        );
      });
    } else {
      console.log('todo id not found');
    }
  }

  openUpdateTodo(id: number) {
    const todo = this.todoData.find((c) => c.id === id);
    if (todo) {
      const dialogRef = this.dialog.open(EditTodoComponent, {
        width: '700px',
        data: {
          todoData: todo
        }
      });
      const childComponentInstance = dialogRef.componentInstance as EditTodoComponent;
      childComponentInstance.onUpdateTodo.subscribe(() => {
        this.ngxService.start();
        this.handleEmitEvent();
        this.ngxService.stop();
        this.menuOpen = Array(this.todoData.length).fill(false);
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without updatig todo');
        }
        this.menuOpen = Array(this.todoData.length).fill(false);
      });
    } else {
      console.log('Todo not found');
    }
  }

  deleteTodo(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this todo? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.todoService.deleteTodo(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('todo deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting todo');
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

  formatDate(dateString: any): string {
    const date = new Date(dateString);
    return date.toDateString();
  }

  watchGetCenterFromMap() {
    this.rxStompService.watch('/topic/getCenterFromMap').subscribe((message) => {
      const receivedCategories: TodoList = JSON.parse(message.body);
      this.todoData.push(receivedCategories);
    });
  }

  watchLikeCenter() {
    this.rxStompService.watch('/topic/likeCenter').subscribe((message) => {
      const receivedCenter: TodoList = JSON.parse(message.body);
      const centerId = this.todoData.findIndex(todo => todo.id === receivedCenter.id)
      this.todoData[centerId] = receivedCenter
    });
  }

  watchUpdateCenter() {
    this.rxStompService.watch('/topic/updateCenter').subscribe((message) => {
      const receivedCenter: TodoList = JSON.parse(message.body);
      const centerId = this.todoData.findIndex(todo => todo.id === receivedCenter.id)
      this.todoData[centerId] = receivedCenter
    });
  }

  watchUpdateCenterStatus() {
    this.rxStompService.watch('/topic/updateCenterStatus').subscribe((message) => {
      const receivedCenter: TodoList = JSON.parse(message.body);
      const centerId = this.todoData.findIndex(todo => todo.id === receivedCenter.id)
      this.todoData[centerId] = receivedCenter
    });
  }

  watchUpdatePhoto() {
    this.rxStompService.watch('/topic/updateCenterPhoto').subscribe((message) => {
      const receivedCenter: TodoList = JSON.parse(message.body);
      const centerId = this.todoData.findIndex(todo => todo.id === receivedCenter.id)
      this.todoData[centerId] = receivedCenter
    });
  }

  watchDeleteCenter() {
    this.rxStompService.watch('/topic/deleteCenter').subscribe((message) => {
      const receivedCenter: TodoList = JSON.parse(message.body);
      this.todoData = this.todoData.filter(todo => todo.id !== receivedCenter.id);
    });
  }
}


