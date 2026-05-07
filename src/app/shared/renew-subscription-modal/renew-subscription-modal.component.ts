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
