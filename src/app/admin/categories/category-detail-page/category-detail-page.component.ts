import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, take, takeUntil } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { CategoryService } from 'src/app/services/category.service';
import { selectCategories } from 'src/app/state/category/category.selectors';

/**
 * Routed detail page for a single category — `/dashboard/categories/:id`
 * (also reachable via `/dashboard/hub/categories/:id`, same lazy module).
 *
 * Replaces the old CategoryDetailsModalComponent dialog. Content is ported
 * as-is from that modal; the only real differences are the page chrome
 * (back link instead of a close button) and how the data arrives: the modal
 * received it via MAT_DIALOG_DATA from the list component, this page looks
 * it up in the already-loaded categories slice first (instant, no spinner
 * when navigating from the list) and falls back to a fresh fetch by id for
 * direct links / refreshes.
 */
@Component({
  selector: 'app-category-detail-page',
  templateUrl: './category-detail-page.component.html',
  styleUrls: ['./category-detail-page.component.css']
})
export class CategoryDetailPageComponent implements OnInit, OnDestroy {
  categoryData: Categories | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private categoryService: CategoryService,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.loading = false;
          this.categoryData = null;
          return;
        }
        this.loadCategory(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategory(id: number): void {
    this.loading = true;
    this.store.select(selectCategories)
      .pipe(take(1))
      .subscribe(categories => {
        const found = (categories || []).find(category => category.id === id);
        if (found) {
          this.categoryData = found;
          this.loading = false;
        } else {
          this.categoryService.getCategory(id).subscribe({
            next: (response) => {
              this.categoryData = response.data;
              this.loading = false;
            },
            error: () => {
              this.categoryData = null;
              this.loading = false;
            }
          });
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
