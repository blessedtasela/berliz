import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { TodoList } from 'src/app/models/todoList.interface';
import { loadTodos } from 'src/app/state/todo/todo.actions';
import { selectTodos } from 'src/app/state/todo/todo.selectors';

/**
 * Routed detail page for a single to-do item — `/dashboard/todo-lists/:id`
 * (also reachable via `/dashboard/hub/todo-lists/:id`, same lazy module).
 *
 * Replaces the old TodoListDetailsModalComponent dialog. Looks the item up
 * in the already-loaded `todos` slice and dispatches `loadTodos()` if
 * empty (direct link / refresh).
 */
@Component({
  selector: 'app-todo-list-detail-page',
  templateUrl: './todo-list-detail-page.component.html',
  styleUrls: ['./todo-list-detail-page.component.css']
})
export class TodoListDetailPageComponent implements OnInit, OnDestroy {
  todoData: TodoList | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.loading = false;
          this.todoData = null;
          return;
        }
        this.loadTodo(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTodo(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectTodos)
      .pipe(takeUntil(this.destroy$))
      .subscribe(todos => {
        const found = (todos || []).find(todo => todo.id === id);
        if (found) {
          this.todoData = found;
          this.loading = false;
        } else if (!todos || todos.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadTodos());
          }
        } else {
          this.todoData = null;
          this.loading = false;
        }
      });
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
