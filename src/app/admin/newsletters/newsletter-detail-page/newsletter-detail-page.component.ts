import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Newsletter } from 'src/app/models/newsletter.model';
import { loadNewsletters } from 'src/app/state/newsletter/newsletter.actions';
import { selectNewsletters } from 'src/app/state/newsletter/newsletter.selectors';

/**
 * Routed detail page for a single newsletter subscriber —
 * `/dashboard/newsletters/:id` (also reachable via
 * `/dashboard/hub/newsletters/:id`, same lazy module).
 *
 * Replaces the old NewsletterDetailsModalComponent dialog. Looks the
 * subscriber up in the already-loaded `newsletters` slice and dispatches
 * `loadNewsletters()` if it is empty (direct link / refresh).
 */
@Component({
  selector: 'app-newsletter-detail-page',
  templateUrl: './newsletter-detail-page.component.html',
  styleUrls: ['./newsletter-detail-page.component.css']
})
export class NewsletterDetailPageComponent implements OnInit, OnDestroy {
  newsletterData: Newsletter | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.loading = false;
          this.newsletterData = null;
          return;
        }
        this.loadNewsletter(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadNewsletter(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectNewsletters)
      .pipe(takeUntil(this.destroy$))
      .subscribe(newsletters => {
        const found = (newsletters || []).find(newsletter => newsletter.id === id);
        if (found) {
          this.newsletterData = found;
          this.loading = false;
        } else if (!newsletters || newsletters.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadNewsletters());
          }
        } else {
          this.newsletterData = null;
          this.loading = false;
        }
      });
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
