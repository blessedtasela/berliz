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

  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() toggleSelectAll = new EventEmitter<void>();
  @Output() bulkAction = new EventEmitter<string>();
  @Output() open = new EventEmitter<TodoList>();
  @Output() toggle = new EventEmitter<TodoList>();
  @Output() edit = new EventEmitter<TodoList>();
  @Output() markComplete = new EventEmitter<TodoList>();
  @Output() delete = new EventEmitter<TodoList>();

  showBulk = false;
  static activeMenu: MyTodoListsComponent | null = null;

  constructor() { }

  toggleBulkMenu(event: Event) {
    event.stopPropagation();
    this.showBulk = !this.showBulk;
  }

  doBulk(action: string) {
    this.bulkAction.emit(action);
    this.showBulk = false;
  }

  @HostListener('document:click')
  handleOutsideClick() {
    this.showBulk = false;
  }
}