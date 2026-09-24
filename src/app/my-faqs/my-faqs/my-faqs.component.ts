import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  /** Deep link target -- ?faqId=<id> from search/notifications. Expanded and scrolled to once the list loads. */
  private deepLinkFaqId: number | null = null;
  private deepLinkHandled = false;

  constructor(private store: Store, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const faqIdParam = this.route.snapshot.queryParamMap.get('faqId');
    this.deepLinkFaqId = faqIdParam ? Number(faqIdParam) : null;
    if (this.deepLinkFaqId) this.expandedIds.add(this.deepLinkFaqId);

    this.store.dispatch(loadActiveFaqs());
    this.subscriptions.push(
      this.store.select(selectActiveFaqs).subscribe((faqs: Faq[]) => {
        this.faqGroups = groupFaqsByCategory(faqs);
        this.scrollToDeepLinkFaq();
      }),
      this.store.select(selectFaqLoading).subscribe((loading: boolean) => {
        this.loading = loading;
      })
    );
  }

  /** Runs once, the first time the deep-linked FAQ is actually present in a loaded group. */
  private scrollToDeepLinkFaq(): void {
    if (!this.deepLinkFaqId || this.deepLinkHandled) return;
    const exists = this.faqGroups.some(g => g.faqs.some(f => f.id === this.deepLinkFaqId));
    if (!exists) return;

    this.deepLinkHandled = true;
    setTimeout(() => {
      document.getElementById(`faq-${this.deepLinkFaqId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
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
