import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Notifications } from 'src/app/models/Notifications.interface';

@Component({
  selector: 'app-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.css']
})
export class NotificationDetailsComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Notifications,
    private dialogRef: MatDialogRef<NotificationDetailsComponent>
  ) {}

  closeModal() {
    this.dialogRef.close();
  }
}