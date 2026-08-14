import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Tasks } from 'src/app/models/tasks.interface';
import { loadTasks } from 'src/app/state/task/task.actions';
import { selectTasks } from 'src/app/state/task/task.selectors';

/**
 * Routed detail page for a single task — `/dashboard/tasks/:id`
 * (also reachable via `/dashboard/hub/tasks/:id`, same lazy module).
 *
 * Replaces the old TaskDetailsModalComponent dialog. Looks the task up in
 * the already-loaded `tasks` slice and dispatches `loadTasks()` if empty
 * (direct link / refresh).
 */
@Component({
  selector: 'app-task-detail-page',
  templateUrl: './task-detail-page.component.html',
  styleUrls: ['./task-detail-page.component.css']
})
export class TaskDetailPageComponent implements OnInit, OnDestroy {
  taskData: Tasks | null = null;
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
          this.taskData = null;
          return;
        }
        this.loadTask(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTask(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectTasks)
      .pipe(takeUntil(this.destroy$))
      .subscribe(tasks => {
        const found = (tasks || []).find(task => task.id === id);
        if (found) {
          this.taskData = found;
          this.loading = false;
        } else if (!tasks || tasks.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadTasks());
          }
        } else {
          this.taskData = null;
          this.loading = false;
        }
      });
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
