import { Injectable } from '@angular/core';
import { TodoService } from './todo.service';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { Priority, TodoList } from '../models/todoList.interface';
import { SnackBarService } from './snack-bar.service';
import { FilterState, SearchSortOption } from '../models/FilterState.interface';

@Injectable({
  providedIn: 'root'
})
export class TodoStateService {
  private myTodoSubject = new BehaviorSubject<any>(null);
  public myTodoData$: Observable<TodoList[]> = this.myTodoSubject.asObservable();
  private allTodosSubject = new BehaviorSubject<any>(null);
  public allTodosData$: Observable<TodoList[]> = this.allTodosSubject.asObservable();
  responseMessage: any;
  todoSortOptions: SearchSortOption[] = [
    { key: 'completed', label: 'Completed', priority: true },
    { key: 'pending', label: 'Pending', priority: true },
    { key: 'high', label: 'High Priority', priority: true },
    { key: 'today', label: 'Today', priority: true },
    { key: 'overdue', label: 'Overdue', priority: true },
    { key: 'yesterday', label: 'Yesterday', priority: false },
    { key: 'week', label: 'This Week', priority: false },
    { key: 'month', label: 'This Month', priority: false },
    { key: 'range', label: 'Date Range', priority: false },
    { key: 'exact-date', label: 'Exact Date', priority: false }
  ];

  constructor(private todoService: TodoService,
    private snackbarService: SnackBarService) { }

  setmyTodosSubject(data: TodoList[]) {
    this.myTodoSubject.next(data);
  }

  setAllTodosSubject(data: TodoList[]) {
    this.allTodosSubject.next(data);
  }

  getAllTodos(): Observable<TodoList[]> {
    return this.todoService.getAllTodos().pipe(
      map((response: any) => {
        return response.sort((a: TodoList, b: TodoList) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
      }),
      catchError((error) => {
        this.snackbarService.openSnackBar(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
        return of([]);
      })
    );
  }

  getMyTodos(): Observable<TodoList[]> {
    return this.todoService.getmyTodos().pipe(
      map((response: any) => {
        return response.sort((a: TodoList, b: TodoList) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
      }),
      catchError((error) => {
        console.log(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
          console.log(this.responseMessage);
        } else {
          this.responseMessage = genericError;
        }
        console.log(this.responseMessage, 'error');
        return of([]);
      })
    );
  }

  sortByPriority(todos: TodoList[]): TodoList[] {

    const order: Record<Priority, number> = {
      high: 0,
      normal: 1,
      low: 2,
      due: 3
    };
    return [...todos].sort((a, b) =>
      (order[a.priority] ?? 99) - (order[b.priority] ?? 99)
    );
  }


  filter(state: FilterState, source: 'my' | 'all'): TodoList[] {

    const baseList =
      source === 'my'
        ? this.myTodoSubject.value ?? []
        : this.allTodosSubject.value ?? [];

    let list = [...baseList];

    // -----------------------------
    // TEXT SEARCH
    // -----------------------------
    // -----------------------------
    // TEXT SEARCH (multi-field)
    // -----------------------------
    if (state.query?.trim()) {
      const words = state.query
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 0);

      list = list.filter(t => {
        const fullName = `${t.user.firstName} ${t.user.lastName}`.toLowerCase();
        const text = [
          t.task,
          t.status,
          t.priority || '',
          fullName
        ].join(' ').toLowerCase();

        return words.every(w => text.includes(w));
      });
    }


    // -----------------------------
    // EXACT DATE
    // -----------------------------
    if (state.selectedSorts?.includes('exact-date') && state.exactDate) {
      const target = this.normalize(state.exactDate);

      list = list.filter(t => {
        const d = this.normalize(t.date);
        return d === target;
      });
    }

    // -----------------------------
    // DATE RANGE
    // -----------------------------
    if (
      state.selectedSorts?.includes('range') &&
      state.startDate &&
      state.endDate
    ) {
      const start = this.normalize(state.startDate);
      const end = this.normalize(state.endDate, true); // end of day

      list = list.filter(t => {
        const d = new Date(t.date).getTime();
        return d >= start && d <= end;
      });
    }

    // -----------------------------
    // SORT FILTERS (status + time)
    // -----------------------------
    if (state.selectedSorts?.length) {
      list = this.applySortFilters(list, state);
    }

    // -----------------------------
    // SORT BY DATE (latest first)
    // -----------------------------
    list = list.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return list;
  }

  private normalize(date: string | Date, endOfDay = false): number {
    const d = new Date(date);

    if (endOfDay) {
      d.setHours(23, 59, 59, 999);
    } else {
      d.setHours(0, 0, 0, 0);
    }

    return d.getTime();
  }

  private applySortFilters(list: TodoList[], state: FilterState): TodoList[] {
    const now = new Date();

    const today = this.normalize(now);
    const yesterday = this.normalize(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    );

    return list.filter(t => {
      const baseDate = new Date(t.date);
      const itemDate = this.normalize(baseDate);
      const due = t.dueDate ? new Date(t.dueDate) : null;

      return state.selectedSorts.some(sort => {
        switch (sort) {

          // STATUS
          case 'pending': return t.status === 'pending';
          case 'in-progress': return t.status === 'in-progress';
          case 'completed': return t.status === 'completed';
          case 'cancelled': return t.status === 'cancelled';

          // PRIORITY
          case 'priority-high': return t.priority === 'high';
          case 'priority-normal': return t.priority === 'normal';
          case 'priority-low': return t.priority === 'low';

          // TIME (created)
          case 'today': return itemDate === today;
          case 'yesterday': return itemDate === yesterday;
          case 'week':
            return (now.getTime() - baseDate.getTime()) <= 7 * 86400000;
          case 'month':
            return baseDate.getMonth() === now.getMonth() &&
              baseDate.getFullYear() === now.getFullYear();
          case 'recent':
            return (now.getTime() - baseDate.getTime()) <= 3 * 86400000;

          // DUE DATE helpers
          case 'overdue':
            return !!due && due.getTime() < today;
          case 'due-today':
            return !!due && this.normalize(due) === today;

          case 'all': return true;

          default: return false;
        }
      });
    });
  }

}


