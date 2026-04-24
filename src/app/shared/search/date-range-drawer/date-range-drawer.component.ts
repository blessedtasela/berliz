import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-date-range-drawer',
  templateUrl: './date-range-drawer.component.html'
})
export class DateRangeDrawerComponent {
  @Input() drawerOpen = false;
  @Input() sortOptions: any[] = [];
  @Input() selectedSorts: string[] = [];
  @Input() startDate: string | null = null;
  @Input() endDate: string | null = null;
  @Input() dateRangeError: string | null = null;
  @Input() exactDate: string | null = null;
  @Input() exactDateError: string | null = null;

  @Output() toggleSort = new EventEmitter<string>();
  @Output() startDateChange = new EventEmitter<string>();
  @Output() endDateChange = new EventEmitter<string>();
  @Output() applyDateRange = new EventEmitter<void>();
  @Output() exactDateChange = new EventEmitter<string>();
  @Output() applyExactDate = new EventEmitter<void>();


}
