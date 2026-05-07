import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SearchSortOption } from 'src/app/models/FilterState.interface';

@Component({
  selector: 'app-filter-chips',
  templateUrl: './filter-chips.component.html'
})
export class FilterChipsComponent {
  @Input() visibleSortOptions: SearchSortOption[] = [];
  @Input() selectedSorts: string[] = [];
  @Input() showMoreButton = false;

  @Output() toggleSort = new EventEmitter<string>();
  @Output() toggleDrawer = new EventEmitter<void>();
}
