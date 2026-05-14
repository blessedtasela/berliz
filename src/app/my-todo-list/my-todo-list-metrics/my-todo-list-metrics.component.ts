import { Component, Input } from '@angular/core';
import { TodoList } from 'src/app/models/todoList.interface';

@Component({
  selector: 'app-my-todo-list-metrics',
  templateUrl: './my-todo-list-metrics.component.html'
})
export class MyTodoListMetricsComponent {

  @Input() todos: TodoList[] = [];

  get total(): number {
    return this.todos.length;
  }

  get completed(): number {
    return this.todos.filter(t => t.status === 'completed').length;
  }

  get inProgress(): number {
    return this.todos.filter(t => t.status === 'in-progress').length;
  }

  get pending(): number {
    return this.todos.filter(t => t.status === 'pending').length;
  }

  get cancelled(): number {
    return this.todos.filter(t => t.status === 'cancelled').length;
  }

  get overdue(): number {
    const now = Date.now();
    return this.todos.filter(t =>
      new Date(t.dueDate).getTime() < now &&
      t.status !== 'completed' &&
      t.status !== 'cancelled'
    ).length;
  }

  get dueSoon(): number {
    const now = Date.now();
    return this.todos.filter(t => {
      const diff = new Date(t.dueDate).getTime() - now;
      return diff > 0 && diff <= 2 * 24 * 60 * 60 * 1000 &&
        t.status !== 'completed' && t.status !== 'cancelled';
    }).length;
  }

  get completionRate(): number {
    return this.total > 0 ? Math.round((this.completed / this.total) * 100) : 0;
  }

  get highPriority(): number {
    return this.todos.filter(t =>
      t.priority?.toLowerCase() === 'high' && t.status !== 'completed'
    ).length;
  }
}