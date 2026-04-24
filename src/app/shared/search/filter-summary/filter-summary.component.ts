import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter-summary',
  templateUrl: './filter-summary.component.html'
})
export class FilterSummaryComponent {
  @Input() activeFilters: string[] = [];
  @Input() selectedSorts: string[] = [];
  @Input() startDate: string | null = null;
  @Input() endDate: string | null = null;
  @Input() hasSearch = false;

  @Output() reset = new EventEmitter<void>();
}
