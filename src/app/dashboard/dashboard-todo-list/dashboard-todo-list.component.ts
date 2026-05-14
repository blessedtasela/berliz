import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { TodoList } from 'src/app/models/todoList.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TodoStateService } from 'src/app/services/todo-state.service';
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
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.sub = this.todoState.myTodoData$.subscribe(todos => {
      if (todos) this.todoData = todos;
    });

    this.loadTodos();
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

  initializeWebSocketListeners() {
    this.wsSub = this.rxStomp.watch('/topic/todos').subscribe(msg => {
      const event = JSON.parse(msg.body);
      switch (event.type) {
        case 'ADD': this.todoData = [event.data, ...this.todoData]; break;
        case 'UPDATE':
        case 'STATUS': this.todoData = this.todoData.map(t => t.id === event.data.id ? event.data : t); break;
        case 'DELETE': this.todoData = this.todoData.filter(t => t.id !== event.data.id); break;
      }
      this.todoState.setmyTodosSubject([...this.todoData]);
    });
  }

  // ── COMPUTED LISTS ──────────────────────────────────────

  get overdueTodos(): TodoList[] {
    const now = Date.now();
    return this.todoData.filter(t =>
      new Date(t.dueDate).getTime() < now &&
      t.status !== 'completed' &&
      t.status !== 'cancelled'
    );
  }

  get dueSoonTodos(): TodoList[] {
    const now = Date.now();
    return this.todoData.filter(t => {
      const diff = new Date(t.dueDate).getTime() - now;
      return diff > 0 && diff <= 2 * 24 * 60 * 60 * 1000 &&
        t.status !== 'completed' && t.status !== 'cancelled';
    });
  }

  get displayedTodos(): TodoList[] {
    return this.todoData.slice(0, 12);
  }

  // ── METRICS ─────────────────────────────────────────────

  get metrics() {
    const total = this.todoData.length;
    const completed = this.todoData.filter(t => t.status === 'completed').length;
    const inProgress = this.todoData.filter(t => t.status === 'in-progress').length;
    const overdue = this.overdueTodos.length;
    const cancelled = this.todoData.filter(t => t.status === 'cancelled').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, overdue, cancelled, completionRate };
  }

  // ── UI HELPERS ───────────────────────────────────────────

  openTodoDetails(todo: TodoList) {
    this.dialog.open(TodoDetailsModalComponent, {
      data: todo,
      width: '550px',
      panelClass: 'berliz-dialog'
    }).afterClosed().subscribe(result => {
      if (result) this.loadTodos();
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      'completed': 'Done',
      'in-progress': 'Active',
      'pending': 'Pending',
      'cancelled': 'Cancelled'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'completed': 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'pending': 'bg-red-100 text-red-600',
      'cancelled': 'bg-gray-200 text-gray-600'
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  priorityClass(priority: string): string {
    const map: Record<string, string> = {
      'high': 'text-red-600',
      'normal': 'text-blue-600',
      'low': 'text-green-600'
    };
    return map[priority?.toLowerCase()] ?? 'text-gray-500';
  }

  isDueNow(todo: TodoList): boolean {
    return new Date(todo.dueDate) <= new Date();
  }

  isDueSoon(todo: TodoList): boolean {
    const diff = new Date(todo.dueDate).getTime() - Date.now();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }

  getDueColor(todo: TodoList): string {
    if (todo.status === 'completed') return 'text-green-600';
    if (todo.status === 'cancelled') return 'text-gray-400';
    if (this.isDueNow(todo)) return 'text-red-600';
    if (this.isDueSoon(todo)) return 'text-yellow-600';
    if (todo.status === 'in-progress') return 'text-blue-600';
    return 'text-gray-500';
  }

  getDueLabel(todo: TodoList): string {
    const now = new Date();
    const due = new Date(todo.dueDate);
    const diff = due.getTime() - now.getTime();
    const abs = Math.abs(diff);
    const days = Math.floor(abs / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const hours = Math.floor(abs / 3600000);
    const minutes = Math.floor(abs / 60000);
    const p = (v: number, u: string) => `${v} ${u}${v !== 1 ? 's' : ''}`;

    if (diff <= 0) {
      if (hours < 24) return 'Due today';
      if (days < 7) return `Overdue by ${p(days, 'day')}`;
      if (days < 30) return `Overdue by ${p(weeks, 'week')}`;
      return `Overdue by ${p(months, 'month')}`;
    }
    if (minutes < 60) return `Due in ${p(minutes, 'minute')}`;
    if (hours < 24) return `Due in ${p(hours, 'hour')}`;
    if (days < 7) return `Due in ${p(days, 'day')}`;
    if (days < 30) return `Due in ${p(weeks, 'week')}`;
    return `Due in ${p(months, 'month')}`;
  }
}