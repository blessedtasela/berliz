import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TodoList } from 'src/app/models/todoList.interface';

@Component({
  selector: 'app-my-todo-list-item',
  templateUrl: './my-todo-list-item.component.html',
  styleUrls: ['./my-todo-list-item.component.css']
})
export class MyTodoListItemComponent {

  @Input() todo!: TodoList;
  @Input() searchQuery = '';

  @Output() open = new EventEmitter<TodoList>();
  @Output() toggle = new EventEmitter<TodoList>();
  @Output() edit = new EventEmitter<TodoList>();
  @Output() markComplete = new EventEmitter<TodoList>();
  @Output() delete = new EventEmitter<TodoList>();

  menuOpen = false;

  ngAfterViewInit() {
    this.subscribeToOutsideClicks();
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  onEdit(event: MouseEvent) {
    event.stopPropagation();
    this.edit.emit(this.todo);
    this.closeMenu();
  }

  onMarkComplete(event: MouseEvent) {
    event.stopPropagation();
    this.markComplete.emit(this.todo);
    this.closeMenu();
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    this.delete.emit(this.todo);
    this.closeMenu();
  }

  highlight(text: string) {
    if (!this.searchQuery) return text;
    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, `<span class="bg-yellow-200">$1</span>`);
  }

  subscribeToOutsideClicks(): void {
    document.addEventListener('click', () => {
      this.closeMenu();
    });
  }

}
