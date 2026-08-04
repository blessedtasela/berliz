import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Newsletter } from 'src/app/models/newsletter.model';
import { loadNewsletters } from 'src/app/state/newsletter/newsletter.actions';
import { selectNewsletters } from 'src/app/state/newsletter/newsletter.selectors';

@Component({
  selector: 'app-newsletters',
  templateUrl: './newsletters.component.html',
  styleUrls: ['./newsletters.component.css']
})
export class NewslettersComponent {
  newsletterData: Newsletter[] = [];
  totalNewsletters: number = 0;
  newsletterLength: number = 0;
  searchComponent: string = 'newsletter'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  constructor(private store: Store,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadNewsletters());
    this.subscriptions.push(
      this.store.select(selectNewsletters).subscribe((newsletter) => {
        this.newsletterData = newsletter;
        this.totalNewsletters = newsletter.length
        this.newsletterLength = newsletter.length;
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: Newsletter[]): void {
    this.newsletterData = results;
    this.totalNewsletters = results.length;
  }


}
