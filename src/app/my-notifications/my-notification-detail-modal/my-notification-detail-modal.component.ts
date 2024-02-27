import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Notifications } from 'src/app/models/Notifications.interface';
import { NotificationService } from 'src/app/services/notification.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-my-notification-detail-modal',
  templateUrl: './my-notification-detail-modal.component.html',
  styleUrls: ['./my-notification-detail-modal.component.css']
})
export class MyNotificationDetailModalComponent {
  emitEVent = new EventEmitter()
  myNotification!: Notifications;
  responseMessage: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private notificationService: NotificationService,
    private dialogRef: MatDialogRef<MyNotificationDetailModalComponent>,
    private datePipe: DatePipe) {
    this.myNotification = this.data.notificationData;
  }

  ngOnInit(): void {
    this.markAsRead()
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  markAsRead() {
    this.notificationService.readNotification(this.myNotification.id)
      .subscribe((response: any) => {
        this.responseMessage = response.message;
        this.emitEVent.emit()
        console.log(this.responseMessage, ' - message received');
      }, (error) => {
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        console.log(this.responseMessage, ' - error');
      });
  }

}
