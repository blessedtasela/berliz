import { Component, Input } from '@angular/core';
import { TodoList } from 'src/app/models/todoList.interface';

@Component({
    selector: 'app-my-todo-list-timeline',
    templateUrl: './my-todo-list-timeline.component.html',
    styleUrls: ['./my-todo-list-timeline.component.css'],
    standalone: false
})
export class MyTodoListTimelineComponent {

  @Input() todos: TodoList[] = [];

  // Cached per input array (see MySubscriptionsTimelineComponent.sorted).
  private sortedFrom: TodoList[] | null = null;
  private sortedCache: TodoList[] = [];

  get sortedTodos() {
    if (this.sortedFrom !== this.todos) {
      this.sortedFrom = this.todos;
      this.sortedCache = [...this.todos].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
    return this.sortedCache;
  }

  isOverdue(t: TodoList): boolean {
    return new Date(t.dueDate).getTime() < Date.now() &&
      t.status !== 'completed' && t.status !== 'cancelled';
  }

  isDueSoon(t: TodoList): boolean {
    const diff = new Date(t.dueDate).getTime() - Date.now();
    return diff > 0 && diff <= 2 * 24 * 60 * 60 * 1000;
  }
}
