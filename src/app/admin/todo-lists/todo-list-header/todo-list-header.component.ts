import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TodoList } from 'src/app/models/todoList.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TodoStateService } from 'src/app/services/todo-state.service';
import { AddTodoModalComponent } from '../add-todo-modal/add-todo-modal.component';

@Component({
  selector: 'app-todo-list-header',
  templateUrl: './todo-list-header.component.html',
  styleUrls: ['./todo-list-header.component.css']
})
export class TodoListHeaderComponent {
  selectedSortOption: string = 'date';
  @Input() todoListData: TodoList[] = [];
  @Input() totalTodoList: number = 0;
  @Input() todoListLength: number = 0;


  constructor(private todoStateService: TodoStateService,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.watchDeleteTodo()
    this.watchGetTodoFromMap()
  }

  handleEmitEvent() {
    this.todoStateService.getAllTodos().subscribe((todo) => {
      this.ngxService.start()
      this.todoListData = todo;
      this.totalTodoList = this.todoListData.length
      this.todoListLength = this.todoListData.length
      this.todoStateService.setAllTodosSubject(this.todoListData);
      this.ngxService.stop()
    });
  }

  sortNewsletterData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.todoListData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case 'task':
        this.todoListData.sort((a, b) => {
          return a.task.localeCompare(b.task);
        });
        break;
      case 'id':
        this.todoListData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'lastUpdate':
        this.todoListData.sort((a, b) => {
          const dateA = new Date(a.lastUpdate);
          const dateB = new Date(b.lastUpdate);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      default:
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortNewsletterData();
  }

  openAddTodo() {
    const dialogRef = this.dialog.open(AddTodoModalComponent, {
      width: '700px',
      height: '400px',
    });
    const childComponentInstance = dialogRef.componentInstance as AddTodoModalComponent;
    childComponentInstance.onAddTodoList.subscribe(() => {
      dialogRef.close('todo added successfully')
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a todo');
      }
    });
  }

  watchGetTodoFromMap() {
    this.rxStompService.watch('/topic/getTodoFromMap').subscribe((message) => {
      const receivedTodo: TodoList = JSON.parse(message.body);
      this.todoListData.push(receivedTodo);
      this.todoListLength = this.todoListData.length;
      this.totalTodoList = this.todoListData.length;
    });
  }

  watchDeleteTodo() {
    this.rxStompService.watch('/topic/deleteTodo').subscribe((message) => {
      const receivedNewsletter: TodoList = JSON.parse(message.body);
      this.todoListData = this.todoListData.filter(todo => todo.id !== receivedNewsletter.id);
      this.todoListLength = this.todoListData.length;
      this.totalTodoList = this.todoListData.length;
    });
  }

}



