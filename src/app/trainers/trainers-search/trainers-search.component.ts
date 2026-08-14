import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of, Subscription } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Store } from '@ngrx/store';
import { selectActiveTrainers } from 'src/app/state/trainer/trainer.selector';
import { loadActiveTrainers } from 'src/app/state/trainer/trainer.actions';

@Component({
  selector: 'app-trainers-search',
  templateUrl: './trainers-search.component.html',
  styleUrls: ['./trainers-search.component.css']
})
export class TrainersSearchComponent implements OnInit, OnDestroy {

  @Input() trainers: Trainers[] = [];
  @Output() allTrainers = new EventEmitter<Trainers[]>();

  activeTrainers: Trainers[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: string = 'name';

  readonly searchOptions = [
    { value: 'name', label: 'Name' },
    { value: 'category', label: 'Services' },
    { value: 'address', label: 'Location' },
  ];

  private subs: Subscription[] = [];

  constructor(
    private store: Store,
    private snackbar: SnackBarService,
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    // Load from state cache or fetch
    this.store.dispatch(loadActiveTrainers());
    this.subs.push(
      this.store.select(selectActiveTrainers).subscribe((data: Trainers[]) => {
        this.activeTrainers = data ? [...data] : [];
        this.trainers = [...this.activeTrainers];
        this.allTrainers.emit(this.trainers);
      })
    );

  }

  ngAfterViewInit(): void {
    this.initSearch();
  }

  private initSearch(): void {
    const input = this.elementRef.nativeElement.querySelector('input');
    if (!input) return;

    this.subs.push(
      fromEvent(input, 'keyup').pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap(),
        switchMap((q: string) => this.runSearch(q))
      ).subscribe({
        next: results => { this.allTrainers.emit(results); },
        error: () => { this.snackbar.openSnackBar('Search failed.', 'error'); }
      })
    );
  }

  runSearch(query: string): Observable<Trainers[]> {
    const q = query.trim().toLowerCase();
    if (!q) return of(this.activeTrainers);

    return of(this.activeTrainers.filter(t => {
      switch (this.selectedSearchCriteria) {
        case 'name': return t.name?.toLowerCase().includes(q);
        case 'category': return t.categories?.some(c => c.name?.toLowerCase().includes(q));
        case 'address': return t.address?.toLowerCase().includes(q);
        default: return false;
      }
    }));
  }

  searchByButton(): void {
    if (!this.searchQuery?.trim()) {
      this.snackbar.openSnackBar('Enter a search term.', 'error');
      return;
    }
    this.runSearch(this.searchQuery).subscribe({
    });
  }

  onSearchCriteriaChange(): void {
    if (this.searchQuery?.trim()) this.searchByButton();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}