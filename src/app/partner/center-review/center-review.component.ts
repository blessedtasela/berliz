import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { CenterReviews } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadMyCenterReviews } from 'src/app/state/center/center.actions';
import { selectMyCenterReviews } from 'src/app/state/center/center.selectors';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center-review',
  templateUrl: './center-review.component.html',
  styleUrls: ['./center-review.component.css']
})
export class CenterReviewComponent implements OnInit, OnDestroy {

  @Output() emitEvent = new EventEmitter();

  centerReviews: CenterReviews[] = [];

  showAll = false;
  visibleCount = 4;

  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private centerService: CenterService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadReviews(): void {
    this.store.dispatch(loadMyCenterReviews());
    this.subscriptions.push(
      this.store.select(selectMyCenterReviews).subscribe(reviews => {
        this.centerReviews = reviews ?? [];
      })
    );
  }

  get visibleReviews(): CenterReviews[] {
    return this.showAll ? this.centerReviews : this.centerReviews.slice(0, this.visibleCount);
  }

  isActive(status: string): boolean {
    return status?.toLowerCase() === 'true' || status?.toLowerCase() === 'active';
  }

  toggleStatus(review: CenterReviews): void {
    this.loader.start();
    this.centerService.updateReviewStatus(review.id).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Review status updated', '');
        this.store.dispatch(loadMyCenterReviews());
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}
