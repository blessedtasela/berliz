import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TodoStateService } from 'src/app/services/todo-state.service';
import { TodoService } from 'src/app/services/todo.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { TodoList } from 'src/app/models/todoList.interface';
import { FilterState, SearchSortOption } from 'src/app/models/FilterState.interface';
import { TodoDetailsModalComponent } from 'src/app/shared/todo-details-modal/todo-details-modal.component';

@Component({
  selector: 'app-my-todo-list-main',
  templateUrl: './my-todo-list-main.component.html'
})
export class MyTodoListMainComponent implements OnInit, OnDestroy {

  @Input() searchQuery = '';
  placeholder: string = 'Search tasks...';
  todoSortOptions: SearchSortOption[] = [];
  allTodos: TodoList[] = [];
  filteredTodos: TodoList[] = [];
  pagedTodos: TodoList[] = [];
  sections: any[] = [];
  selectedSorts: string[] = [];

  selectedTodoIds: number[] = [];

  currentPage = 1;
  pageSize = 50;

  private subs: Subscription[] = [];


  constructor(
    private todoState: TodoStateService,
    private todoService: TodoService,
    private snackbar: SnackBarService,
    private dialog: MatDialog
  ) {
    this.todoSortOptions = this.todoState.todoSortOptions;
  }

  ngOnInit(): void {
    const sub = this.todoState.getMyTodos().subscribe(data => {
      this.allTodos = data;
      this.todoState.setmyTodosSubject(data);

      this.filteredTodos = [...data];
      this.currentPage = 1;
      this.updatePage();
    });

    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  get isFiltering(): boolean {
    return (
      this.searchQuery.trim().length > 0 ||
      this.selectedSorts?.length > 0
    );
  }

  // SEARCH PANEL
  onFilterStateChange(state: FilterState): void {
    this.searchQuery = state.query || '';
    this.selectedSorts = state.selectedSorts || [];
    this.filteredTodos = this.todoState.filter(state, 'my');

    this.currentPage = 1;
    this.updatePage();
    this.selectedTodoIds = [];
  }
  // PAGINATION
  get todosLength() {
    return this.filteredTodos.length;
  }

  get startIndex() {
    return this.todosLength === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex() {
    return Math.min(this.currentPage * this.pageSize, this.todosLength);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
    }
  }

  nextPage(): void {
    const maxPage = Math.ceil(this.todosLength / this.pageSize);
    if (this.currentPage < maxPage) {
      this.currentPage++;
      this.updatePage();
    }
  }

  private updatePage(): void {
    const maxPage = Math.ceil(this.todosLength / this.pageSize);
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage === 0 ? 1 : maxPage;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.pagedTodos = this.filteredTodos.slice(start, end);
    this.buildSections();
  }

  // GROUPING
  private buildSections(): void {
    const now = new Date();

    const today: TodoList[] = [];
    const yesterday: TodoList[] = [];
    const thisWeek: TodoList[] = [];
    const older: TodoList[] = [];

    const isToday = (d: Date) => d.toDateString() === now.toDateString();
    const isYesterday = (d: Date) => {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return d.toDateString() === y.toDateString();
    };
    const isThisWeek = (d: Date) => {
      const diff = now.getTime() - d.getTime();
      return diff <= 7 * 86400000 && diff > 2 * 86400000;
    };

    this.pagedTodos.forEach(t => {
      const d = new Date(t.date);
      if (isToday(d)) today.push(t);
      else if (isYesterday(d)) yesterday.push(t);
      else if (isThisWeek(d)) thisWeek.push(t);
      else older.push(t);
    });

    const groups = [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'This Week', items: thisWeek },
      { label: 'Older', items: older }
    ];

    this.sections = groups.filter(g => g.items.length > 0);
  }

  // SELECTION
  isSelectAllChecked(): boolean {
    return this.pagedTodos.length > 0 && this.pagedTodos.every(t => t.checked);
  }

  onToggleSelectAll(): void {
    const allSelected = this.isSelectAllChecked();
    this.pagedTodos.forEach(t => (t.checked = !allSelected));

    if (!allSelected) {
      const idsToAdd = this.pagedTodos
        .map(t => t.id)
        .filter(id => !this.selectedTodoIds.includes(id));
      this.selectedTodoIds = [...this.selectedTodoIds, ...idsToAdd];
    } else {
      const idsOnPage = this.pagedTodos.map(t => t.id);
      this.selectedTodoIds = this.selectedTodoIds.filter(
        id => !idsOnPage.includes(id)
      );
    }
  }

  onToggleItem(todo: TodoList): void {
    todo.checked = !todo.checked;
    if (todo.checked) {
      if (!this.selectedTodoIds.includes(todo.id)) {
        this.selectedTodoIds.push(todo.id);
      }
    } else {
      this.selectedTodoIds = this.selectedTodoIds.filter(
        id => id !== todo.id
      );
    }
  }

  // OPEN DETAILS
  onOpenTodo(todo: TodoList): void {
    this.onEditTodo(todo);
  }

  // EDIT
  onEditTodo(todo: TodoList): void {
    const dialogRef = this.dialog.open(TodoDetailsModalComponent, {
      width: '500px',
      data: todo
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const payload = { ...todo, ...result };

      this.todoService.updateTodoList(payload).subscribe(() => {
        this.refreshTodos();
        this.snackbar.openSnackBar('Task updated', '');
      });
    });
  }

  // MARK COMPLETE
  onBulkAction(action: string): void {

    if (this.selectedTodoIds.length === 0) {
      this.snackbar.openSnackBar('Select at least one Task', '');
      return;
    }

    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: `Are you sure you want to ${action} selected tasks?`,
        confirmation: true,
        disableClose: true
      }
    });

    const payload = {
      action,
      ids: this.selectedTodoIds.join(',')
    };


    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.todoService.bulkAction(payload).subscribe((res: any) => {
        this.snackbar.openSnackBar(res.message || 'Action completed', '');
        this.refreshTodos();
        dialogRef.close();
      });
    });

    this.subs.push(sub);
  }

  // DELETE
  onDeleteTodo(todo: TodoList): void {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: `delete "${todo.task}"? This is irreversible.`,
        confirmation: true,
        disableClose: true
      }
    });

    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.todoService.deleteTodo(todo.id).subscribe((res: any) => {
        this.snackbar.openSnackBar(res.message || 'Task deleted', '');
        this.refreshTodos();
        dialogRef.close();
      });
    });

    this.subs.push(sub);
  }

  refreshTodos(): void {
    const sub = this.todoState.getMyTodos().subscribe(data => {
      this.allTodos = data;
      this.filteredTodos = [...data];
      this.currentPage = 1;
      this.updatePage();
      this.selectedTodoIds = [];
    });

    this.subs.push(sub);
  }
}
