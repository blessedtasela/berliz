import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Tags } from 'src/app/models/tags.interface';
import { loadTags } from 'src/app/state/tag/tag.actions';
import { selectTags } from 'src/app/state/tag/tag.selectors';

/**
 * Routed detail page for a single tag — `/dashboard/tags/:id`
 * (also reachable via `/dashboard/hub/tags/:id`, same lazy module).
 *
 * Replaces the old TagDetailsModalComponent dialog. Looks the tag up in
 * the already-loaded `tags` slice and dispatches `loadTags()` if empty
 * (direct link / refresh).
 */
@Component({
  selector: 'app-tag-detail-page',
  templateUrl: './tag-detail-page.component.html',
  styleUrls: ['./tag-detail-page.component.css']
})
export class TagDetailPageComponent implements OnInit, OnDestroy {
  tagData: Tags | null = null;
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
          this.tagData = null;
          return;
        }
        this.loadTag(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTag(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectTags)
      .pipe(takeUntil(this.destroy$))
      .subscribe(tags => {
        const found = (tags || []).find(tag => tag.id === id);
        if (found) {
          this.tagData = found;
          this.loading = false;
        } else if (!tags || tags.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadTags());
          }
        } else {
          this.tagData = null;
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
