import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Faq } from 'src/app/models/faq.model';
import { loadFaqs, loadFaqsFailure, loadFaqsSuccess } from 'src/app/state/faq/faq.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectFaqs } from 'src/app/state/faq/faq.selectors';
import { AddFaqModalComponent } from '../add-faq-modal/add-faq-modal.component';

@Component({
    selector: 'app-faqs',
    templateUrl: './faqs.component.html',
    styleUrls: ['./faqs.component.css'],
    standalone: false
})
export class FaqsComponent implements OnInit, OnDestroy {
  faqsData: Faq[] = [];
  totalFaqs: number = 0;
  selectedSortOption: string = 'category';
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty list. */
  loadError: string | null = null;

  constructor(
    private dialog: MatDialog,
    private store: Store,
    private actions$: Actions) { }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(watchLoadError(this.actions$, loadFaqsFailure, [loadFaqs, loadFaqsSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadFaqs());
    this.subscriptions.push(
      this.store.select(selectFaqs).subscribe((allFaqs) => {
        this.faqsData = [...allFaqs].sort((a, b) => {
          const cat = (a.category || '').localeCompare(b.category || '');
          return cat !== 0 ? cat : (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
        });
        this.totalFaqs = allFaqs.length;
      })
    );
  }

  retryLoad(): void {
    this.store.dispatch(loadFaqs());
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    switch (this.selectedSortOption) {
      case 'category':
        this.faqsData.sort((a, b) => {
          const cat = (a.category || '').localeCompare(b.category || '');
          return cat !== 0 ? cat : (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
        });
        break;
      case 'date':
        this.faqsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'lastUpdate':
        this.faqsData.sort((a, b) => new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime());
        break;
      case 'id':
        this.faqsData.sort((a, b) => a.id - b.id);
        break;
    }
  }

  openAddFaq() {
    const dialogRef = this.dialog.open(AddFaqModalComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddFaqModalComponent;
    childComponentInstance.onAddFaqEmit.subscribe(() => {
      this.handleEmitEvent();
    });
  }
}
