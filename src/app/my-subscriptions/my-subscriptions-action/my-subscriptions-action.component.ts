import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { MySubscriptionDetailModalComponent } from '../my-subscription-detail-modal/my-subscription-detail-modal.component';
import { RenewSubscriptionModalComponent } from 'src/app/shared/renew-subscription-modal/renew-subscription-modal.component';

@Component({
  selector: 'app-my-subscriptions-action',
  templateUrl: './my-subscriptions-action.component.html',
  styleUrls: ['./my-subscriptions-action.component.css']
})
export class MySubscriptionsActionComponent {
  @Input() subscription!: Subscriptions;
  @Output() refresh = new EventEmitter<void>();

  open = false;

  constructor(
    private dialog: MatDialog,
    private subscriptionService: SubscriptionService,
    private snackbar: SnackBarService,
    private loader: NgxUiLoaderService
  ) { }

  toggle() {
    this.open = !this.open;
  }

  viewDetails() {
    this.open = false;
    const dialogRef = this.dialog.open(MySubscriptionDetailModalComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: { subscription: this.subscription }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.refresh.emit();
    });
  }

  delete() {
    this.open = false;

    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: 'Delete this subscription? This action is irreversible.',
        confirmation: true
      }
    });

    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.loader.start();
      this.subscriptionService.deleteSubscription(this.subscription.id).subscribe({
        next: (res: any) => {
          this.loader.stop();
          this.snackbar.openSnackBar(res?.message || 'Deleted', '');
          this.refresh.emit();
        },
        error: (err: any) => {
          this.loader.stop();
          this.snackbar.openSnackBar(err.error?.message || 'Error', 'error');
        }
      });
    });
  }

  renew() {
    this.open = false;
    const dialogRef = this.dialog.open(RenewSubscriptionModalComponent, {
      width: '420px',
      maxWidth: '95vw',
      data: { subscription: this.subscription }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.refresh.emit();
    });
  }
}
