import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FilterState, SearchSortOption } from 'src/app/models/FilterState.interface';

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html'
})
export class SearchPanelComponent implements OnInit {

  @Input() searchQuery: string = '';
  @Input() sortOptions: SearchSortOption[] = [];
  @Input() placeholder: string = 'Search...';
  @Output() searchQueryChange = new EventEmitter<string>();
  @Output() stateChange = new EventEmitter<FilterState>();

  selectedSorts: string[] = [];
  startDate: string | null = null;
  endDate: string | null = null;
  exactDate: string | null = null;
  dateRangeError: string | null = null;
  exactDateError: string | null = null;

  drawerOpen = false;
  showMoreButton = true;
  visibleSortOptions: SearchSortOption[] = [];

  constructor() { }

  ngOnInit() {
    this.updateVisibleOptions();
    this.emitState();
  }

  updateVisibleOptions() {
    const width = window.innerWidth;
    this.visibleSortOptions = width < 640
      ? this.sortOptions.slice(0, 3)
      : this.sortOptions.slice(0, 5);
  }

  toggleDrawer() {
    this.drawerOpen = !this.drawerOpen;
  }

  toggleSort(key: string) {
    if (this.selectedSorts.includes(key)) {
      this.selectedSorts = this.selectedSorts.filter(k => k !== key);
    } else {
      this.selectedSorts.push(key);
    }

    this.emitState();
  }


  onQueryChange(value: string) {
    this.searchQuery = value;
    this.searchQueryChange.emit(value); // <-- THIS updates notification-main
    this.emitState();
  }


  clearSearch() {
    this.searchQuery = '';
    this.resetFilters();
  }

  resetFilters() {
    this.selectedSorts = [];
    this.startDate = null;
    this.endDate = null;
    this.dateRangeError = null;
    this.emitState();
  }

  applyDateRange() {
    this.emitState();
  }

  get activeFilters() {
    return this.selectedSorts
      .filter(k => k !== 'range' && k !== 'exact-date')
      .map(k => this.sortOptions.find(o => o.key === k)?.label || '');
  }

  emitState() {
    this.stateChange.emit({
      query: this.searchQuery,
      selectedSorts: this.selectedSorts,
      startDate: this.startDate,
      endDate: this.endDate,
      exactDate: this.exactDate
    });
  }

  applyExactDate() {
    this.emitState();
  }

  onDateRangeChange() {
    if (!this.startDate || !this.endDate) {
      this.dateRangeError = null;
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    if (start > end) {
      this.dateRangeError = 'Start date cannot be after end date';
    } else {
      this.dateRangeError = null;
    }
  }

  onExactDateChange() {
    if (!this.exactDate) {
      this.exactDate = null;
      return;
    }

    const date = new Date(this.exactDate);

    if (date === null) {
      this.exactDateError = 'Date cannot be empty';
    } else {
      this.dateRangeError = null;
    }
  }


}
