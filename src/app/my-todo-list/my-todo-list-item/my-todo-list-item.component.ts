import {
  Component,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
  OnDestroy,
  HostListener,
  SimpleChanges,
  ElementRef
} from '@angular/core';

import { TodoList } from 'src/app/models/todoList.interface';

@Component({
  selector: 'app-my-todo-list-item',
  templateUrl: './my-todo-list-item.component.html',
  styleUrls: ['./my-todo-list-item.component.css']
})
export class MyTodoListItemComponent implements OnDestroy {

  @Input() todo!: TodoList;
  @Input() searchQuery = '';
  @Input() selectionMode = false;

  @Output() open = new EventEmitter<TodoList>();
  @Output() toggle = new EventEmitter<TodoList>();
  @Output() edit = new EventEmitter<TodoList>();
  @Output() quickAction = new EventEmitter<{ action: string; id: number }>();
  @Output() delete = new EventEmitter<TodoList>();

  menuOpen = false;
  pressTimer: any;
  private longPressTriggered = false;
  private menuActionTaken = false;
  static activeMenu: MyTodoListItemComponent | null = null;

  constructor(private el: ElementRef) { }

  private outsideClickHandler = () => {
    this.menuOpen = false;
  };

  ngOnDestroy(): void {
    document.removeEventListener('click', this.outsideClickHandler);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectionMode'] && this.selectionMode) {
      this.menuOpen = false;
    }
  }

  subscribeToOutsideClicks() {
    this.menuOpen = false;
  }

  // -----------------------------------
  // OUTSIDE CLICK (Angular-safe)
  // -----------------------------------


  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }
  // ---------------------------------------------------------
  // MENU
  // ---------------------------------------------------------

  toggleMenu(event: MouseEvent) {
    event.stopPropagation();

    if (this.selectionMode) return;

    // close previously opened menu
    if (
      MyTodoListItemComponent.activeMenu &&
      MyTodoListItemComponent.activeMenu !== this
    ) {
      MyTodoListItemComponent.activeMenu.menuOpen = false;
    }

    // toggle current menu
    this.menuOpen = !this.menuOpen;

    // register current menu
    MyTodoListItemComponent.activeMenu =
      this.menuOpen ? this : null;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }



  // ---------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------

  onQuickAction(action: string, event?: MouseEvent): void {
    event?.stopPropagation();
    this.menuActionTaken = true;
    this.quickAction.emit({ action, id: this.todo.id });
    this.closeMenu();
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.menuActionTaken = true;
    this.edit.emit(this.todo);
    this.closeMenu();
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit(this.todo);
    this.closeMenu();
  }

  // ---------------------------------------------------------
  // SELECTION
  // ---------------------------------------------------------

  onToggleTodo(event: MouseEvent): void {
    event.stopPropagation();
    this.toggle.emit(this.todo);
  }

  onItemClick(event: MouseEvent): void {
    event.stopPropagation();

    if (this.menuActionTaken) {
      this.menuActionTaken = false;
      return;
    }

    this.cancelPress();

    if (this.longPressTriggered) {
      this.longPressTriggered = false;
      return;
    }

    if (this.selectionMode) {
      this.toggle.emit(this.todo);
      return;
    }

    this.open.emit(this.todo);
  }

  // ---------------------------------------------------------
  // LONG PRESS
  // ---------------------------------------------------------

  startPress(event: MouseEvent): void {
    if (this.selectionMode) return;

    this.longPressTriggered = false;

    this.pressTimer = setTimeout(() => {
      this.longPressTriggered = true;
      this.toggle.emit(this.todo);
    }, 1000);
  }
  cancelPress(): void {
    clearTimeout(this.pressTimer);
  }

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  highlight(text: string): string {
    if (!this.searchQuery?.trim()) return text;

    const words = this.searchQuery
      .split(/\s+/)
      .filter(w => w.trim().length > 0)
      .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    const regex = new RegExp(words.join('|'), 'gi');

    return text.replace(
      regex,
      match => `<span class="bg-yellow-200 rounded px-0.5">${match}</span>`
    );
  }

  isOverdue(todo: TodoList): boolean {
    return (
      new Date(todo.dueDate).getTime() < Date.now() &&
      todo.status !== 'completed'
    );
  }

  isDueSoon(todo: TodoList): boolean {
    const diff = new Date(todo.dueDate).getTime() - Date.now();
    const days = diff / (1000 * 60 * 60 * 24);

    return days > 0 && days <= 2;
  }

  isCompletedOnTime(todo: TodoList): boolean {
    if (!todo?.dueDate || !todo?.lastUpdate) return true;

    const due = new Date(todo.dueDate).getTime();
    const completed = new Date(todo.lastUpdate).getTime();

    return completed <= due;
  }

}