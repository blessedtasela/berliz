import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Notifications } from 'src/app/models/Notifications.interface';
import { NotificationService } from 'src/app/services/notification.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.css']
})
export class NotificationDetailsComponent {

  emitEVent = new EventEmitter();
  responseMessage: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Notifications,
    private dialogRef: MatDialogRef<NotificationDetailsComponent>,
    private notificationService: NotificationService
  ) {
    dialogRef.backdropClick().subscribe(() => {
      dialogRef.close(true);
    });
  }


  markAsRead() {
    this.notificationService.readNotification(this.data.id).subscribe({
      next: () => {
        this.emitEVent.emit();
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.responseMessage = error.error?.message || genericError;
      }
    });
  }

  close() {
    this.dialogRef.close(true);
  }
}
