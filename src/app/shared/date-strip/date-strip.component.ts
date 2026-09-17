import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IconsModule } from 'src/app/icons/icons.module';

export interface DateStripDay {
  value: string; // yyyy-MM-dd
  dayLabel: string; // "Mon"
  dateLabel: string; // "14"
  monthLabel: string; // "Sep"
  isToday: boolean;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Horizontally-scrolling strip of upcoming days for picking a date, with a
 * "Show more" chip so it never silently caps out (the strip used to hard-stop
 * at 21 days with no way to reach anything further out) plus a "Custom date"
 * escape hatch for jumping straight to any future date.
 */
@Component({
  selector: 'app-date-strip',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  templateUrl: './date-strip.component.html'
})
export class DateStripComponent implements OnInit {

  @Input() selectedDate: string | null = null;
  @Input() initialDays = 21;
  @Input() pageSize = 21;
  @Input() maxDays = 120;
  @Input() invalid = false;

  @Output() dateSelected = new EventEmitter<string>();

  days: DateStripDay[] = [];
  showCustom = false;
  customDateValue = '';

  private loadedCount = 0;

  get minDate(): string {
    return this.formatDateLocal(new Date());
  }

  get canLoadMore(): boolean {
    return this.loadedCount < this.maxDays;
  }

  /** True once the selected date exists but has scrolled past what's been generated (picked via "Custom date"). */
  get selectedDateOutsideStrip(): boolean {
    return !!this.selectedDate && !this.days.some(d => d.value === this.selectedDate);
  }

  ngOnInit(): void {
    this.loadedCount = Math.min(this.initialDays, this.maxDays);
    this.rebuild();
  }

  loadMore(): void {
    this.loadedCount = Math.min(this.loadedCount + this.pageSize, this.maxDays);
    this.rebuild();
  }

  select(day: DateStripDay): void {
    this.showCustom = false;
    this.dateSelected.emit(day.value);
  }

  toggleCustom(): void {
    this.showCustom = !this.showCustom;
    if (this.showCustom) {
      this.customDateValue = this.selectedDate ?? '';
    }
  }

  onCustomDateChange(value: string): void {
    if (!value) return;
    this.customDateValue = value;
    this.dateSelected.emit(value);
  }

  formatChipLabel(value: string): string {
    const d = this.parseDateLocal(value);
    return `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
  }

  private rebuild(): void {
    const days: DateStripDay[] = [];
    const today = new Date();
    for (let i = 0; i < this.loadedCount; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push({
        value: this.formatDateLocal(d),
        dayLabel: WEEKDAY_LABELS[d.getDay()],
        dateLabel: String(d.getDate()),
        monthLabel: MONTH_LABELS[d.getMonth()],
        isToday: i === 0
      });
    }
    this.days = days;
  }

  private formatDateLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parseDateLocal(value: string): Date {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
  }
}
