import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { ContactUs } from 'src/app/models/contact-us.model';
import { loadContactUs } from 'src/app/state/contact-us/contact-us.actions';
import { selectContactUsList } from 'src/app/state/contact-us/contact-us.selectors';

/**
 * Routed detail page for a single contact-us message —
 * `/dashboard/contact-us/:id` (also reachable via `/dashboard/hub/contact-us/:id`,
 * same lazy module).
 *
 * Replaces the old ContactUsDetailsModalComponent dialog. No get-by-id
 * endpoint exists, so this looks the message up in the already-loaded
 * `contactUs` slice and dispatches `loadContactUs()` if empty.
 */
@Component({
  selector: 'app-contact-us-detail-page',
  templateUrl: './contact-us-detail-page.component.html',
  styleUrls: ['./contact-us-detail-page.component.css']
})
export class ContactUsDetailPageComponent implements OnInit, OnDestroy {
  contactUs: ContactUs | null = null;
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
          this.contactUs = null;
          return;
        }
        this.loadContactUs(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadContactUs(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectContactUsList)
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => {
        const found = (list || []).find(item => item.id === id);
        if (found) {
          this.contactUs = found;
          this.loading = false;
        } else if (!list || list.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadContactUs());
          }
        } else {
          this.contactUs = null;
          this.loading = false;
        }
      });
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
