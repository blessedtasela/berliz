import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RenewData } from 'src/app/models/subscriptions.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionService } from 'src/app/services/subscription.service';

@Component({
  selector: 'app-renew-subscription-modal',
  templateUrl: './renew-subscription-modal.component.html',
  styleUrls: ['./renew-subscription-modal.component.css']
})
export class RenewSubscriptionModalComponent {
 durationMonths = 1;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RenewData,
    private dialogRef: MatDialogRef<RenewSubscriptionModalComponent>,
    private subscriptionService: SubscriptionService,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService
  ) {}

  /** True while the subscription being "renewed" still has time left -- the user needs
   *  to know this is adding on top of, not replacing, what they already have. */
  get isCurrentlyActive(): boolean {
    const sub = this.data.subscription;
    return sub?.status === 'true' && !!sub.endDate && new Date(sub.endDate).getTime() > Date.now();
  }

  /** What their access will run to after this renewal -- extends the CURRENT end date
   *  when still active (matches the backend's own math), otherwise starts from today. */
  get newEndDatePreview(): Date {
    const sub = this.data.subscription;
    const base = this.isCurrentlyActive ? new Date(sub.endDate) : new Date();
    const result = new Date(base);
    result.setMonth(result.getMonth() + (Number(this.durationMonths) || 0));
    return result;
  }

  close() {
    this.dialogRef.close();
  }

  renew() {
    this.loader.start();
    const payload = {
      id: this.data.subscription.id,
      durationMonths: this.durationMonths
    };

    this.subscriptionService.renewSubscription(payload).subscribe({
      next: (res: any) => {
        this.loader.stop();
        this.snackbar.openSnackBar(res?.message || 'Subscription renewed', '');
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.loader.stop();
        this.snackbar.openSnackBar(err.error?.message || 'Error', 'error');
      }
    });
  }
}
