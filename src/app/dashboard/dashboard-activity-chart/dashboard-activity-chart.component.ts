import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  HostListener
} from '@angular/core';

import { Chart, registerables } from 'chart.js/auto';

import { Store } from '@ngrx/store';
import { Subscription, combineLatest, take } from 'rxjs';

import { TodoList } from 'src/app/models/todoList.interface';
import { AuthService } from 'src/app/services/auth.service';
import { loadMyTodos, loadTodos } from 'src/app/state/todo/todo.actions';
import { selectMyTodos, selectTodoLoading, selectTodos } from 'src/app/state/todo/todo.selectors';

/**
 * Formerly a decorative "App activity" bar chart with invented labels
 * ("Days Spent", "Locations", "Places"…) and hardcoded values.
 * It now charts REAL activity: todos created per day over the last 7 days,
 * bucketed client-side from TodoList.date — platform-wide for admins,
 * personal for every other role. Bar chart type preserved.
 */
@Component({
  selector: 'app-dashboard-activity-chart',
  templateUrl: './dashboard-activity-chart.component.html',
  styleUrls: ['./dashboard-activity-chart.component.css']
})
export class DashboardActivityChartComponent implements OnInit, OnDestroy {
  /** Kept for template compatibility with dashboard-main; not the data source. */
  @Input() data: any;

  @ViewChild('activityCanvas', { static: true })
  activityCanvas!: ElementRef<HTMLCanvasElement>;

  ready = false;
  total = 0;
  scopeLabel = 'You';

  private chart!: Chart<'bar', number[], string>;
  private subscriptions: Subscription[] = [];
  private sawLoading = false;
  private isAdminView = false;

  private static readonly DAYS = 7;

  constructor(
    private store: Store,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.isAdminView = this.auth.isAdmin();
    this.scopeLabel = this.isAdminView ? 'All users' : 'You';

    this.subscriptions.push(
      combineLatest([this.todos$(), this.store.select(selectTodoLoading)])
        .subscribe(([todos, loading]) => {
          if (loading) {
            this.sawLoading = true;
            return;
          }
          if (!this.sawLoading && (todos ?? []).length === 0) return;

          this.ready = true;
          this.renderChart(todos ?? []);
        })
    );

    this.fetchIfNeeded();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.chart) this.chart.destroy();
  }

  private todos$() {
    return this.isAdminView
      ? this.store.select(selectTodos)
      : this.store.select(selectMyTodos);
  }

  /** Only hit the API when the slice is empty and no request is already running. */
  private fetchIfNeeded() {
    combineLatest([this.todos$(), this.store.select(selectTodoLoading)])
      .pipe(take(1))
      .subscribe(([todos, loading]) => {
        if (loading || (todos ?? []).length > 0) return;
        this.store.dispatch(this.isAdminView ? loadTodos() : loadMyTodos());
      });
  }

  /** Local-time day key — avoids the UTC shift that toISOString() would introduce. */
  private dayKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  private renderChart(todos: TodoList[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const labels: string[] = [];
    const keys: string[] = [];

    for (let i = DashboardActivityChartComponent.DAYS - 1; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      labels.push(day.toLocaleDateString(undefined, { weekday: 'short' }));
      keys.push(this.dayKey(day));
    }

    const counts = new Map<string, number>(keys.map(k => [k, 0]));

    todos.forEach(t => {
      if (!t?.date) return;
      const created = new Date(t.date);
      if (isNaN(created.getTime())) return;
      const key = this.dayKey(created);
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const values = keys.map(k => counts.get(k) ?? 0);
    this.total = values.reduce((sum, v) => sum + v, 0);

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = values;
      this.chart.update();
      return;
    }

    Chart.register(...registerables);

    this.chart = new Chart<'bar', number[], string>(this.activityCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Todos created',
          data: values,
          backgroundColor: 'rgba(220,38,38,0.12)',
          borderColor: 'rgba(220,38,38,1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#111827',
            titleColor: '#f9fafb',
            bodyColor: '#d1d5db',
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 11 }, color: '#9ca3af' }
          },
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(0,0,0,0.04)' },
            ticks: { font: { size: 11 }, color: '#9ca3af', stepSize: 1 }
          }
        }
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    if (this.chart) {
      setTimeout(() => this.chart.resize(), 50);
    }
  }
}
