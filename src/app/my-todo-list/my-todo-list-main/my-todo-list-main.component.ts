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

  actionMessages: Record<string, string> = {
    delete: 'delete',
    pause: 'pause',
    completed: 'mark as completed',
    'in-progress': 'start',
    pending: 'restart',
    cancelled: 'cancel'
  };


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
    const maxPage = Math.ceil(this.filteredTodos.length / this.pageSize);
    if (this.currentPage < maxPage) {
      this.currentPage++;
      this.updatePage();
    }
  }

  private updatePage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    const paged = this.filteredTodos.slice(start, end);

    this.buildSections(paged);
  }

  private buildSections(pagedTodos: TodoList[]): void {

    const now = new Date();
    const todayStr = now.toDateString();

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();

    const overdue: TodoList[] = [];
    const today: TodoList[] = [];
    const tomorrowList: TodoList[] = [];
    const upcoming: TodoList[] = [];
    const completed: TodoList[] = [];
    const cancelled: TodoList[] = [];

    for (const todo of pagedTodos) {

      const due = new Date(todo.dueDate);

      if (todo.status === 'completed') {
        completed.push(todo);
        continue;
      }

      if (todo.status === 'cancelled') {
        cancelled.push(todo);
        continue;
      }

      const dueStr = due.toDateString();

      if (due.getTime() < now.getTime() && dueStr !== todayStr) {
        overdue.push(todo);
      }
      else if (dueStr === todayStr) {
        today.push(todo);
      }
      else if (dueStr === tomorrowStr) {
        tomorrowList.push(todo);
      }
      else {
        upcoming.push(todo);
      }
    }

    this.sections = [
      { label: 'Overdue', items: overdue },
      { label: 'Due Today', items: today },
      { label: 'Due Tomorrow', items: tomorrowList },
      { label: 'Upcoming', items: upcoming },
      { label: 'Completed', items: completed },
      { label: 'Cancelled', items: cancelled }
    ].filter(g => g.items.length > 0);
  }

  // SELECTION
  isSelectAllChecked(): boolean {
    return this.pagedTodos.length > 0 && this.pagedTodos.every(t => t.checked);
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

      this.refreshTodos();
      this.snackbar.openSnackBar('Todo updated', 'success');
    });
  }

  // BULK ACTION
  onBulkAction(action: string): void {

    if (this.selectedTodoIds.length === 0) {
      this.snackbar.openSnackBar('Please select a task', '');
      return;
    }

    const formattedAction =
      this.actionMessages[action] || action;

    const dialogRef = this.dialog.open(
      PromptModalComponent,
      {
        data: {
          message: `Are you sure you want to ${formattedAction} selected ` +
            `${this.selectedTodoIds.length === 1 ? 'task' : 'tasks'}?`,
          confirmation: true,
          disableClose: true
        }
      }
    );

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

  // QUICK ACTION
  onQuickAction(payload: { action: string; id: number }): void {
    const { action, id } = payload;

    const formattedAction = this.actionMessages[action] || action;

    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: `Are you sure you want to ${formattedAction} this task?`,
        confirmation: true,
        disableClose: true
      }
    });

    const apiPayload = { action, ids: String(id) }; // just the one todo

    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.todoService.quickAction(apiPayload).subscribe((res: any) => {
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

  get selectionMode(): boolean {
    return this.selectedTodoIds.length > 0;
  }

  onToggleTodo(todo: TodoList): void {
    todo.checked = !todo.checked;

    if (todo.checked) {
      if (!this.selectedTodoIds.includes(todo.id)) {
        this.selectedTodoIds.push(todo.id);
      }
    } else {
      this.selectedTodoIds =
        this.selectedTodoIds.filter(id => id !== todo.id);
    }
  }


  onToggleSelectAll(): void {
    const allSelected = this.isSelectAllChecked();

    this.sections.forEach(section => {
      section.items.forEach((t: any) => {
        t.checked = !allSelected;
      });
    });

    this.pagedTodos = this.sections.flatMap((s: any) => s.items);

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

}
