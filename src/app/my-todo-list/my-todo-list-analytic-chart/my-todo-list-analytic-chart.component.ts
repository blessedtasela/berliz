import { AfterViewInit, Component, ElementRef, HostListener, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js/auto';
import { TodoList } from 'src/app/models/todoList.interface';

@Component({
  selector: 'app-my-todo-list-analytic-chart',
  templateUrl: './my-todo-list-analytic-chart.component.html',
  styleUrls: ['./my-todo-list-analytic-chart.component.css']
})

export class MyTodoListAnalyticChartComponent implements AfterViewInit, OnDestroy, OnChanges {

  @Input() todos: TodoList[] = [];

  @ViewChild('todoChart', { static: true })
  todoChart!: ElementRef<HTMLCanvasElement>;

  private chart!: Chart<'bar', number[], string>;

  ngAfterViewInit() {
    this.tryCreateChart();
  }

  ngOnChanges() {
    this.tryCreateChart();
  }

  private tryCreateChart() {
    if (!this.todoChart) return;

    if (this.chart) this.chart.destroy();

    this.createChart();
  }

  private createChart() {
    Chart.register(...registerables);

    const completed = this.todos.filter(t => t.status === 'completed').length;
    const pending = this.todos.filter(t => t.status === 'pending').length;
    const inProgress = this.todos.filter(t => t.status === 'in-progress').length;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(this.todoChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
          label: 'Tasks',
          data: [completed, inProgress, pending],
          backgroundColor: [
            'rgba(34,197,94,0.15)',
            'rgba(59,130,246,0.15)',
            'rgba(239,68,68,0.15)'
          ],
          borderColor: [
            'rgba(34,197,94,1)',
            'rgba(59,130,246,1)',
            'rgba(239,68,68,1)'
          ],
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
            callbacks: {
              label: ctx => ` ${ctx.parsed.y} tasks`
            }
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
            ticks: {
              stepSize: 1,
              font: { size: 11 },
              color: '#9ca3af'
            }
          }
        }
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    if (this.chart) setTimeout(() => this.chart.resize(), 50);
  }

  ngOnDestroy() {
    if (this.chart) this.chart.destroy();
  }
}

