import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { TodoList } from 'src/app/models/todoList.interface';

@Component({
  selector: 'app-my-todo-list-header',
  templateUrl: './my-todo-list-header.component.html',
  styleUrls: ['./my-todo-list-header.component.css']
})
export class MyTodoListHeaderComponent {

  @Input() startIndex = 0;
  @Input() endIndex = 0;
  @Input() total = 0;
  @Input() selectAll = false;
  @Input() searchQuery = '';
  @Input() selectionMode: boolean = false;

  @Output() toggleSelectAll = new EventEmitter<void>();
  @Output() bulkAction = new EventEmitter<string>();
  @Output() prev = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();


  showBulk = false;
  constructor() { }

  toggleBulkMenu(event: Event): void {
    if (!this.selectionMode) {
      return; // Disable bulk menu if not in selection mode
    }
    event.stopPropagation();
    this.showBulk = !this.showBulk;
  }

  doBulk(action: string): void {
    this.bulkAction.emit(action);
    this.showBulk = false;
  }

  @HostListener('document:click')
  handleOutsideClick(): void {
    this.showBulk = false;
  }
}
