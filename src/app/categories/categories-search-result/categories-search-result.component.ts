import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Categories } from 'src/app/models/categories.interface';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { likeCategory, loadMyCategoryLikes } from 'src/app/state/category/category.actions';
import { selectLikedCategoryIds } from 'src/app/state/category/category.selectors';
import { selectUser } from 'src/app/state/user/user.selector';

@Component({
  selector: 'app-categories-search-result',
  templateUrl: './categories-search-result.component.html',
  styleUrls: ['./categories-search-result.component.css']
})
export class CategoriesSearchResultComponent implements OnInit, OnDestroy {
  @Input() categoriesResult: Categories[] = [];
  @Input() totalCategories: number = 0;

  showFullData: boolean = false;
  visibleItems: number = 12;

  user!: Users | null;

  private likedCategoryIds: number[] = [];
  /** categoryIds flipped locally, pending backend reconciliation — makes the heart fill instantly */
  private optimisticLikes = new Set<number>();

  subscriptions: Subscription[] = [];

  constructor(
    private datePipe: DatePipe,
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: SnackBarService,
    private authRedirect: AuthRedirectService
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadMyCategoryLikes());

    this.subscriptions.push(
      this.store.select(selectUser).subscribe(user => this.user = user),

      this.store.select(selectLikedCategoryIds).subscribe(ids => {
        this.likedCategoryIds = ids ?? [];
        // Fresh truth arrived from the backend — drop any optimistic overrides.
        this.optimisticLikes.clear();
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleData(): void {
    this.showFullData = !this.showFullData;
    this.visibleItems = this.showFullData ? this.categoriesResult.length : 12;
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  formatStringToUrl(string: any) {
    return string.replace(/ /g, "-");
  }

  // ── Likes ───────────────────────────────────────────────────────────────────

  isLiked(category: Categories): boolean {
    const cached = this.likedCategoryIds.includes(category.id);
    return this.optimisticLikes.has(category.id) ? !cached : cached;
  }

  likeCategory(category: Categories): void {
    if (!this.user?.email) {
      this.promptLogin();
      return;
    }

    // Flip the heart instantly instead of waiting for the round-trip to land.
    if (this.optimisticLikes.has(category.id)) {
      this.optimisticLikes.delete(category.id);
    } else {
      this.optimisticLikes.add(category.id);
    }

    this.store.dispatch(likeCategory({ id: category.id }));

    this.snackbar.openSnackBar(
      this.isLiked(category) ? `You liked ${category.name}` : `Unliked ${category.name}`,
      ''
    );
  }

  private promptLogin(): void {
    const ref = this.dialog.open(PromptModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        confirmation: true,
        title: 'Login required',
        message: 'You need to be logged in to like a service. Log in to continue?',
        confirmText: 'Log in',
        cancelText: 'Cancel',
        icon: 'log-in'
      }
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        this.authRedirect.goToLogin();
      }
    });
  }
}
