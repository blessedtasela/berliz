import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { TodoList } from 'src/app/models/todoList.interface';

@Component({
  selector: 'app-my-todo-lists',
  templateUrl: './my-todo-lists.component.html',
  styleUrls: ['./my-todo-lists.component.css']
})
export class MyTodoListsComponent {

  @Input() sections: { label: string; items: TodoList[] }[] = [];
  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() total = 0;
  @Input() selectAll = false;
  @Input() searchQuery = '';
  @Input() selectionMode: boolean = false;

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() toggleSelectAll = new EventEmitter<void>();
  @Output() quickAction = new EventEmitter<{ action: string; id: number }>();
  @Output() bulkAction = new EventEmitter<string>();
  @Output() openTodo = new EventEmitter<TodoList>();
  @Output() toggleTodo = new EventEmitter<TodoList>();
  @Output() editTodo = new EventEmitter<TodoList>();
  @Output() markComplete = new EventEmitter<TodoList>();
  @Output() deleteTodo = new EventEmitter<TodoList>();

  showBulk = false;
  static activeMenu: MyTodoListsComponent | null = null;

  constructor() { }

}