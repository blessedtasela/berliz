import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TodoList } from 'src/app/models/todoList.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TodoStateService } from 'src/app/services/todo-state.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TodoDetailsModalComponent } from 'src/app/shared/todo-details-modal/todo-details-modal.component';

@Component({
  selector: 'app-dashboard-todo-list',
  templateUrl: './dashboard-todo-list.component.html',
  styleUrls: ['./dashboard-todo-list.component.css']
})
export class DashboardTodoListComponent implements OnInit, OnDestroy {

  @Input() todoData: TodoList[] = [];
  sub!: Subscription;
  wsSub!: Subscription;

  constructor(
    private todoState: TodoStateService,
    private rxStomp: RxStompService,
    private ngx: NgxUiLoaderService,
    private dialogRef: MatDialog,
  ) { }

  ngOnInit(): void {
    // Subscribe to state
    this.sub = this.todoState.myTodoData$.subscribe(todos => {
      if (todos) {
        this.todoData = todos.slice(0, 5);
      }
    });

    // Initial load
    this.loadTodos();

    // WebSocket listeners
    this.initializeWebSocketListeners();
  }


  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.wsSub?.unsubscribe();
  }

  loadTodos() {
    this.todoState.getMyTodos().subscribe(todos => {
      this.todoState.setmyTodosSubject(todos);
    });
  }

  // ---------------------------------------------------------
  // WEBSOCKET HANDLER (clean + unified)
  // ---------------------------------------------------------
  initializeWebSocketListeners() {
    this.wsSub = this.rxStomp.watch('/topic/todos').subscribe(msg => {
      const event = JSON.parse(msg.body);

      switch (event.type) {
        case 'ADD':
          this.handleAdd(event.data);
          break;

        case 'UPDATE':
          this.handleUpdate(event.data);
          break;

        case 'STATUS':
          this.handleUpdate(event.data);
          break;

        case 'DELETE':
          this.handleDelete(event.data);
          break;
      }

      // Push updated list into state
      this.todoState.setmyTodosSubject([...this.todoData]);
    });
  }

  // ---------------------------------------------------------
  // EVENT HANDLERS
  // ---------------------------------------------------------
  handleAdd(todo: TodoList) {
    this.todoData = [todo, ...this.todoData];
  }

  handleUpdate(updated: TodoList) {
    const index = this.todoData.findIndex(t => t.id === updated.id);
    if (index !== -1) {
      this.todoData[index] = updated;
    }
  }

  handleDelete(todo: TodoList) {
    this.todoData = this.todoData.filter(t => t.id !== todo.id);
  }

  // ---------------------------------------------------------
  // UI HELPERS
  // ---------------------------------------------------------
  openTodoDetails(todo: TodoList) {
    const dialogRef = this.dialogRef.open(TodoDetailsModalComponent, {
      data: todo,
      width: '550px',
      panelClass: 'berliz-dialog'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTodos(); // <--- REFRESH DASHBOARD HERE
      }
    });

  }

  isDueNow(todo: TodoList): boolean {
    const now = new Date();
    const due = new Date(todo.dueDate);
    return due <= now;
  }

  isDueSoon(todo: TodoList): boolean {
    const now = new Date();
    const due = new Date(todo.dueDate);
    const diff = due.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 7;
  }

  getDueLabel(todo: TodoList): string {
    const now = new Date();
    const due = new Date(todo.dueDate);
    const diff = due.getTime() - now.getTime();
    const abs = Math.abs(diff);

    const seconds = Math.floor(abs / 1000);
    const minutes = Math.floor(abs / (1000 * 60));
    const hours = Math.floor(abs / (1000 * 60 * 60));
    const days = Math.floor(abs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (diff <= 0) {
      if (hours < 24) return "Due today";
      if (days === 1) return "Overdue by 1 day";
      if (days < 7) return `Overdue by ${days} days`;
      if (weeks < 4) return `Overdue by ${weeks} weeks`;
      if (months < 12) return `Overdue by ${months} months`;
      return `Overdue by ${years} years`;
    }

    if (seconds < 60) return `Due in ${seconds}s`;
    if (minutes < 60) return `Due in ${minutes}m`;
    if (hours < 24) return `Due in ${hours}h`;
    if (days < 7) return `Due in ${days}d`;
    if (weeks < 4) return `Due in ${weeks}w`;
    if (months < 12) return `Due in ${months} months`;
    return `Due in ${years} years`;
  }

  getDueColor(todo: TodoList): string {
    if (todo.status === 'completed') return 'text-green-600';
    if (todo.status === 'cancelled') return 'text-gray-500';
    if (this.isDueNow(todo)) return 'text-red-600';
    if (this.isDueSoon(todo)) return 'text-yellow-600';
    if (todo.status === 'in-progress') return 'text-yellow-600';
    if (todo.status === 'pending') return 'text-gray-800';
    return 'text-gray-600';
  }
}
