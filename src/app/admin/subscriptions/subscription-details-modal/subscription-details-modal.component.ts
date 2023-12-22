import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscriptions } from 'src/app/models/subscriptions.interface';

@Component({
  selector: 'app-subscription-details-modal',
  templateUrl: './subscription-details-modal.component.html',
  styleUrls: ['./subscription-details-modal.component.css']
})
export class SubscriptionDetailsModalComponent {
  subscriptionData!: Subscriptions;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SubscriptionDetailsModalComponent>,
    private datePipe: DatePipe) {
    this.subscriptionData = this.data.subscriptionData;
  }

  ngOnInit(): void {

  }

  openUrl(url: any){
    window.open(url, '_blank');
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

 
  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

}
