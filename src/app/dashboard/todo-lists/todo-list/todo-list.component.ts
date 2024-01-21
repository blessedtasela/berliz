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
  showBulkAction: boolean = false;
  selectedTodoIds: number[] = [];

  constructor(private todoStateService: TodoStateService,
    private todoService: TodoService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.subscribeToCloseTodoAction()
    this.isTaskCompleted = this.todoData.map(todo => todo.status === 'completed');
    this.watchDeleteTodo()
    this.watchTodoBulkAction()
    this.watchGetTodoFromMap()
    this.watchUpdateTodoList()
    this.watchUpdateTodoStatus()
    this.ngxService.stop();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.todoStateService.getMyTodos().subscribe((myTodo) => {
        this.todoData = myTodo;
        this.totalTodos = this.todoData.length;
        this.todoData.forEach((todo) => {
          todo.checked = false;
          this.selectedTodoIds = [];
        });
        this.todoStateService.setmyTodosSubject(this.todoData);
      }),
    );
  }

  openMenu(index: number) {
    // this.closeTodoDropdown();
    this.menuOpen[index] = !this.menuOpen[index];
  }

  subscribeToCloseTodoAction() {
    document.addEventListener('click', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeBulkDropdown();
        this.closeTodoDropdown();
      }
    });

  }

  isClickInsideDropdown(event: Event): any {
    const dropdownElement = document.getElementById('todoAction');
    return dropdownElement && dropdownElement.contains(event.target as Node);
  }

  closeTodoDropdown() {
    this.menuOpen = Array(this.todoData.length).fill(false);
  }

  closeBulkDropdown() {
    this.showBulkAction = false;
  }

  unSelectAll() {
    this.todoData.forEach((todo) => {
      todo.checked = false;
    });
    this.selectedTodoIds = [];
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  completeTodo(todo: TodoList) {
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
          todo.checked = false
          dialogRef.close('task completed successfully');
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              console.log(`Dialog result: ${result}`);
              todo.checked = false
            } else {
              console.log('Dialog closed without completing task');
              todo.checked = false
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

  toggleBulkAction() {
    this.showBulkAction = !this.showBulkAction;
  }

  isSelectAllChecked(): boolean {
    if (!this.todoData || this.todoData.length === 0) {
      return false;
    }
    return this.todoData.every((todo) => todo.checked);
  }

  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.todoData.forEach((todo) => {
        if (todo.status !== 'completed') {
          todo.checked = true;
          this.selectedTodoIds.push(todo.id);
        }
      });
      console.log("is checked ", this.selectedTodoIds);
    } else {
      this.todoData.forEach((todo) => {
        todo.checked = false;
      });
      this.selectedTodoIds = [];
      console.log('unchecked ', this.selectedTodoIds);
    }
  }

  toggleSelect(event: any, todo: TodoList) {
    const isChecked = event.target.checked;
    if (isChecked) {
      todo.checked = true;
      this.selectedTodoIds.push(todo.id);
      console.log("is checked ", this.selectedTodoIds);
    } else {
      todo.checked = false;
      this.selectedTodoIds = this.selectedTodoIds.filter((id) => id !== todo.id);
      console.log('unchecked ', this.selectedTodoIds);
    }
  }

  submitBulkAction(action: string) {
    const dialogConfig = new MatDialogConfig();
    var message: any;
    if (action === 'pending') {
      message = 'restart all these tasks?';
    }
    if (action === 'in-progress') {
      message = 'begin all these tasks?';
    }
    if (action === 'complete') {
      message = 'complete all these tasks?';
    }
    if (action === 'delete') {
      message = 'delete all these tasks?';
    }
    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    // Convert array of IDs to a comma-separated string
    const idsString = this.selectedTodoIds.join(',');
    const payload = {
      action: action,
      ids: idsString,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.todoService.bulkAction(payload).subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent();
          this.emitEvent.emit()
          this.closeBulkDropdown()
          this.unSelectAll();
          dialogRef.close('task completed successfully');
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without completing task');
              this.closeBulkDropdown()
              this.unSelectAll();
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

  formatDate(dateString: any): string {
    const date = new Date(dateString);
    return date.toDateString();
  }

  watchGetTodoFromMap() {
    this.rxStompService.watch('/topic/getTodoFromMap').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedTodo: TodoList = JSON.parse(message.body);
      // this.todoData.push(receivedTodo);
      // this.totalTodos = this.todoData.length;
    });
  }

  watchTodoBulkAction() {
    this.rxStompService.watch('/topic/todoBulkAction').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedTodo: TodoList = JSON.parse(message.body);
      // this.todoData.push(receivedTodo);
      // this.totalTodos = this.todoData.length;
    });
  }

  watchUpdateTodoList() {
    this.rxStompService.watch('/topic/updateTodoList').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedTodo: TodoList = JSON.parse(message.body);
      // const todoId = this.todoData.findIndex(todoList => todoList.id === receivedTodo.id)
      // this.todoData[todoId] = receivedTodo
    });
  }

  watchUpdateTodoStatus() {
    this.rxStompService.watch('/topic/updateTodoStatus').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedTodo: TodoList = JSON.parse(message.body);
      // const todoId = this.todoData.findIndex(todoList => todoList.id === receivedTodo.id)
      // this.todoData[todoId] = receivedTodo
    });
  }

  watchDeleteTodo() {
    this.rxStompService.watch('/topic/deleteTodo').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedNewsletter: TodoList = JSON.parse(message.body);
      // this.todoData = this.todoData.filter(todo => todo.id !== receivedNewsletter.id);
      // this.totalTodos = this.todoData.length;
    });
  }

}


