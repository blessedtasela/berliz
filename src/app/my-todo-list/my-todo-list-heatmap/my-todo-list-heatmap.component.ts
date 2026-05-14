import { Component, Input, OnChanges } from '@angular/core';
import { TodoList } from 'src/app/models/todoList.interface';

interface DayCell {
  date: Date;
  key: string;
  count: number;
  intensity: string;
  label: string;
  isStreak: boolean;
  inMonth: boolean;
}

@Component({
  selector: 'app-my-todo-list-heatmap',
  templateUrl: './my-todo-list-heatmap.component.html',
  styleUrls: ['./my-todo-list-heatmap.component.css']
})
export class MyTodoListHeatmapComponent implements OnChanges {

  @Input() todos: TodoList[] = [];

  currentDate = new Date();
  weeks: DayCell[][] = [];

  ngOnChanges() {
    this.buildMonth();
  }

  // YYYY-MM-DD (safe local key)
  private key(d: Date): string {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  prevMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.buildMonth();
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.buildMonth();
  }

  private buildMonth() {

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const map = new Map<string, number>();

    // count todos
    for (const t of this.todos) {
      const d = new Date(t.date);
      const k = this.key(d);
      map.set(k, (map.get(k) || 0) + 1);
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const start = new Date(firstDay);
    start.setDate(start.getDate() - start.getDay());

    const end = new Date(lastDay);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const grid: DayCell[][] = [];

    let current = new Date(start);
    let streak = 0;
    let lastHad = false;

    while (current <= end) {

      const weekIndex = Math.floor((current.getTime() - start.getTime()) / (7 * 86400000));

      if (!grid[weekIndex]) grid[weekIndex] = [];

      const k = this.key(current);
      const count = map.get(k) || 0;

      if (count > 0) {
        streak = lastHad ? streak + 1 : 1;
        lastHad = true;
      } else {
        streak = 0;
        lastHad = false;
      }

      grid[weekIndex].push({
        date: new Date(current),
        key: k,
        count,
        isStreak: streak >= 3,
        inMonth: current.getMonth() === month,
        intensity: this.getColor(count, streak >= 3),
        label: `${k} — ${count} tasks`
      });

      current.setDate(current.getDate() + 1);
    }

    this.weeks = grid;
  }

  private getColor(count: number, streak: boolean): string {

    if (!count) return 'bg-gray-100';

    if (streak) return 'bg-orange-500 text-white';

    if (count <= 2) return 'bg-red-200';
    if (count <= 5) return 'bg-red-400';

    return 'bg-red-600';
  }

  isToday(date: Date): boolean {
    const t = new Date();
    return date.getDate() === t.getDate() &&
      date.getMonth() === t.getMonth() &&
      date.getFullYear() === t.getFullYear();
  }
}