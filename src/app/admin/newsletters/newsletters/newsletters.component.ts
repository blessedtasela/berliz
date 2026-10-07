import { Actions } from '@ngrx/effects';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Newsletter } from 'src/app/models/newsletter.model';
import { loadNewsletters, loadNewslettersFailure, loadNewslettersSuccess } from 'src/app/state/newsletter/newsletter.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectNewsletters } from 'src/app/state/newsletter/newsletter.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-newsletters',
    templateUrl: './newsletters.component.html',
    styleUrls: ['./newsletters.component.css'],
    standalone: false
})
export class NewslettersComponent {
  newsletterData: Newsletter[] = [];
  totalNewsletters: number = 0;
  newsletterLength: number = 0;
  searchComponent: string = 'newsletter'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;

  readonly selectNewsletters = selectNewsletters;
  readonly newsletterSearchFields: AdminSearchField<Newsletter>[] = [
    { value: 'email', label: 'Email', accessor: n => n.email },
    { value: 'status', label: 'Status', accessor: n => n.status },
    { value: 'id', label: 'Newsletter id', accessor: n => n.id?.toString() },
  ];

  constructor(private store: Store,
    private dialog: MatDialog, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(watchLoadError(this.actions$, loadNewslettersFailure, [loadNewsletters, loadNewslettersSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadNewsletters());
    this.subscriptions.push(
      this.store.select(selectNewsletters).subscribe((newsletter) => {
        this.newsletterData = newsletter;
        this.totalNewsletters = newsletter.length
        this.newsletterLength = newsletter.length;
      })
    );
  }

  handleSearchResults(results: Newsletter[]): void {
    this.newsletterData = results;
    this.totalNewsletters = results.length;
  }



  retryLoad(): void {
    this.store.dispatch(loadNewsletters());
  }
}
