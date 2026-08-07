import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Faq } from 'src/app/models/faq.model';
import { loadActiveFaqs } from 'src/app/state/faq/faq.actions';
import { selectActiveFaqs, selectFaqLoading } from 'src/app/state/faq/faq.selectors';
import { FaqGroup, groupFaqsByCategory } from 'src/app/state/faq/faq.utils';

@Component({
  selector: 'app-my-faqs',
  templateUrl: './my-faqs.component.html',
  styleUrls: ['./my-faqs.component.css']
})
export class MyFaqsComponent implements OnInit, OnDestroy {
  faqGroups: FaqGroup[] = [];
  loading: boolean = true;
  expandedIds = new Set<number>();
  subscriptions: Subscription[] = [];

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(loadActiveFaqs());
    this.subscriptions.push(
      this.store.select(selectActiveFaqs).subscribe((faqs: Faq[]) => {
        this.faqGroups = groupFaqsByCategory(faqs);
      }),
      this.store.select(selectFaqLoading).subscribe((loading: boolean) => {
        this.loading = loading;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggle(id: number): void {
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  isExpanded(id: number): boolean {
    return this.expandedIds.has(id);
  }

  trackByCategory(_: number, group: FaqGroup): string {
    return group.category;
  }

  trackByFaq(_: number, faq: Faq): number {
    return faq.id;
  }
}
