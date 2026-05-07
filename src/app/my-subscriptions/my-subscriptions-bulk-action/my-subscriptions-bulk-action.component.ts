import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-my-subscriptions-bulk-action',
  templateUrl: './my-subscriptions-bulk-action.component.html',
  styleUrls: ['./my-subscriptions-bulk-action.component.css']
})
export class MySubscriptionsBulkActionComponent {
 @Input() subscriptions: Subscriptions[] = [];
  @Output() refresh = new EventEmitter<void>();

  selectedIds: number[] = [];
  bulkMode = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private snackbar: SnackBarService,
    private loader: NgxUiLoaderService,
    private dialog: MatDialog
  ) {}

  toggleBulkMode() {
    this.bulkMode = !this.bulkMode;
    if (!this.bulkMode) this.selectedIds = [];
  }

  toggleSelectAll(checked: boolean) {
    this.selectedIds = checked ? this.subscriptions.map(s => s.id) : [];
  }

  toggleSelect(id: number, checked: boolean) {
    if (checked) {
      this.selectedIds.push(id);
    } else {
      this.selectedIds = this.selectedIds.filter(x => x !== id);
    }
  }

  bulk(action: string) {
    if (this.selectedIds.length === 0) {
      this.snackbar.openSnackBar('No subscriptions selected', 'error');
      return;
    }

    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: `Are you sure you want to ${action} selected subscriptions?`,
        confirmation: true
      }
    });

    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.loader.start();

      const payload = {
        action,
        ids: this.selectedIds.join(',')
      };

      this.subscriptionService.bulkAction(payload).subscribe({
        next: (res: any) => {
          this.loader.stop();
          this.snackbar.openSnackBar(res?.message || 'Action completed', '');
          this.bulkMode = false;
          this.selectedIds = [];
          this.refresh.emit();
        },
        error: (err: any) => {
          this.loader.stop();
          this.snackbar.openSnackBar(err.error?.message || 'Error', 'error');
        }
      });
    });
  }

  isSelected(id: number) {
    return this.selectedIds.includes(id);
  }
}
