import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
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
import { UpdateTodoModalComponent } from '../update-todo-modal/update-todo-modal.component';

@Component({
  selector: 'app-todo-list-list',
  templateUrl: './todo-list-list.component.html',
  styleUrls: ['./todo-list-list.component.css']
})
export class TodoListListComponent {
  responseMessage: any;
  @Input() todoListData: TodoList[] = [];
  showFullData: boolean = false;
  @Input() totalTodoList: number = 0;
  subscription = new Subscription;

  constructor(private datePipe: DatePipe,
    private todoStateService: TodoStateService,
    private todoService: TodoService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.ngxService.start()
    this.watchUpdateTodoList()
    this.watchUpdateTodoStatus()
    this.watchTodoBulkAction()
    this.ngxService.stop()
  }


  handleEmitEvent() {
    this.todoStateService.getAllTodos().subscribe((todoList) => {
      this.todoListData = todoList;
      this.totalTodoList = this.todoListData.length
      this.todoStateService.setAllTodosSubject(this.todoListData);
    });
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openUpdateTodo(id: number) {
    try {
      const todoList = this.todoListData.find(todoList => todoList.id === id);
      if (todoList) {
        const dialogRef = this.dialog.open(UpdateTodoModalComponent, {
          width: '700px',
          height: '400px',
          data: {
            todoData: todoList,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateTodoModalComponent;
        childComponentInstance.onUpdateTodoList.subscribe(() => {
          dialogRef.close('todoList status updated successfully')
          this.handleEmitEvent()
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without updating todoList');
          }
        });
      } else {
        this.snackbarService.openSnackBar('todoList not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check todoList status", 'error');
    }
  }

  updateTodoStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const todoList = this.todoListData.find(todoList => todoList.id === id);
    var message;
    var status: any;
    if (todoList?.status === 'pending') {
      message = 'begin this task?';
      status = 'in-progress'
    }
    if (todoList?.status === 'in-progress') {
      message = 'finish this task?';
      status = 'completed'
    }
    if (todoList?.status === 'completed') {
      message = 'restart this task?';
      status = 'pending'
    }

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.todoService.updateStatus(id, status)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('todoList status updated successfully')
          this.handleEmitEvent()
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
    });
  }

  deleteTodo(id: number) {
    const todoList = this.todoListData.find(todoList => todoList.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "delete this todoList? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.todoService.deleteTodo(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('todo task deleted successfully')
          this.handleEmitEvent()
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
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchUpdateTodoList() {
    this.rxStompService.watch('/topic/updateTodoList').subscribe((message) => {
      this.handleEmitEvent()
      // const receivedTodo: TodoList = JSON.parse(message.body);
      // const todoId = this.todoListData.findIndex(todoList => todoList.id === receivedTodo.id)
      // this.todoListData[todoId] = receivedTodo
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

  watchUpdateTodoStatus() {
    this.rxStompService.watch('/topic/updateTodoStatus').subscribe((message) => {
      this.handleEmitEvent()
      // const receivedTodo: TodoList = JSON.parse(message.body);
      // const todoId = this.todoListData.findIndex(todoList => todoList.id === receivedTodo.id)
      // this.todoListData[todoId] = receivedTodo
    });
  }

}
