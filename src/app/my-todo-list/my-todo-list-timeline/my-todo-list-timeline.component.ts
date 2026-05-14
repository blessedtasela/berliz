import { Component, Input } from '@angular/core';
import { TodoList } from 'src/app/models/todoList.interface';

@Component({
  selector: 'app-my-todo-list-timeline',
  templateUrl: './my-todo-list-timeline.component.html',
  styleUrls: ['./my-todo-list-timeline.component.css']
})
export class MyTodoListTimelineComponent {

  @Input() todos: TodoList[] = [];

  get sortedTodos() {
    return [...this.todos].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
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
