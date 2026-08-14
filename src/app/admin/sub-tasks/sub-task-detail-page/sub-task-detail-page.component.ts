import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { SubTasks } from 'src/app/models/tasks.interface';
import { loadSubTasks } from 'src/app/state/task/task.actions';
import { selectSubTasks } from 'src/app/state/task/task.selectors';

/**
 * Routed detail page for a single sub-task — `/dashboard/sub-tasks/:id`
 * (also reachable via `/dashboard/hub/sub-tasks/:id`, same lazy module).
 *
 * Replaces the old SubTaskDetailsModalComponent dialog. Looks the sub-task
 * up in the already-loaded `subTasks` slice and dispatches `loadSubTasks()`
 * if empty (direct link / refresh).
 */
@Component({
  selector: 'app-sub-task-detail-page',
  templateUrl: './sub-task-detail-page.component.html',
  styleUrls: ['./sub-task-detail-page.component.css']
})
export class SubTaskDetailPageComponent implements OnInit, OnDestroy {
  subTaskData: SubTasks | null = null;
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
          this.subTaskData = null;
          return;
        }
        this.loadSubTask(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSubTask(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectSubTasks)
      .pipe(takeUntil(this.destroy$))
      .subscribe(subTasks => {
        const found = (subTasks || []).find(subTask => subTask.id === id);
        if (found) {
          this.subTaskData = found;
          this.loading = false;
        } else if (!subTasks || subTasks.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadSubTasks());
          }
        } else {
          this.subTaskData = null;
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
