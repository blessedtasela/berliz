import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscriptions } from 'src/app/models/subscriptions.interface';

@Component({
  selector: 'app-my-subscription-detail-modal',
  templateUrl: './my-subscription-detail-modal.component.html',
  styleUrls: ['./my-subscription-detail-modal.component.css']
})
export class MySubscriptionDetailModalComponent {
  emitEvent = new EventEmitter()
  subscriptionData!: Subscriptions;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MySubscriptionDetailModalComponent>
  ) {
    this.subscriptionData = this.data.subscription || this.data.mySubscriptions;
  }

  isDueSoon(): boolean {
    if (!this.subscriptionData?.endDate || this.subscriptionData.status !== 'true') return false;
    const diffDays = (new Date(this.subscriptionData.endDate).getTime() - new Date().getTime()) / 86400000;
    return diffDays > 0 && diffDays <= 3;
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
