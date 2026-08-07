import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, Subscription, debounceTime, take } from 'rxjs';
import { AdminSearchField } from './admin-search-field.interface';

/**
 * Shared admin list search bar. Per project convention this is a "search-only"
 * component: it SELECTS the full dataset from the store (never dispatches a load
 * itself — the paired list/header components on the page already did that), filters
 * it locally against the query + chosen field, and emits the filtered array. The
 * host page's existing `handleSearchResults(results)` consumes it — that method
 * already exists on every admin container component from an earlier pass, it was
 * just never wired to a search input.
 *
 * Replaces the old one-off `search-<entity>` components (inconsistent styling,
 * duplicated debounce/filter logic, and one — search-partner — that was never
 * finished at all).
 */
@Component({
  selector: 'app-admin-search',
  templateUrl: './admin-search.component.html'
})
export class AdminSearchComponent<T = any> implements OnInit, OnDestroy {
  @Input() selector: any;
  @Input() fields: AdminSearchField<T>[] = [];
  @Input() placeholder = 'Search...';
  @Output() results = new EventEmitter<T[]>();

  query = '';
  selectedField = '';

  private queryChange$ = new Subject<string>();
  private sub?: Subscription;

  constructor(private store: Store) { }

  ngOnInit(): void {
    if (this.fields.length) {
      this.selectedField = this.fields[0].value;
    }
    this.sub = this.queryChange$.pipe(debounceTime(250)).subscribe(() => this.runSearch());
    // Emit the unfiltered set up front so the page's counts/list are correct on load.
    this.runSearch();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.queryChange$.next(value);
  }

  onFieldChange(event: Event): void {
    this.selectedField = (event.target as HTMLSelectElement).value;
    this.runSearch();
  }

  clear(): void {
    this.query = '';
    this.runSearch();
  }

  private runSearch(): void {
    if (!this.selector) {
      return;
    }
    this.store.select(this.selector).pipe(take(1)).subscribe((raw: unknown) => {
      const data = raw as T[];
      const field = this.fields.find(f => f.value === this.selectedField);
      const query = this.query.trim().toLowerCase();
      if (!query || !field) {
        this.results.emit(data);
        return;
      }
      this.results.emit(
        data.filter(item => (field.accessor(item) || '').toString().toLowerCase().includes(query))
      );
    });
  }
}
