import { Component, EventEmitter, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Notifications } from 'src/app/models/Notifications.interface';
import { NotificationService } from 'src/app/services/notification.service';
import { navigateToNotificationEntity, notificationHasDeepLink } from 'src/app/utils/notification-entity-link.util';
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
    private notificationService: NotificationService,
    private router: Router,
  ) {
    dialogRef.backdropClick().subscribe(() => {
      dialogRef.close(true);
    });
  }

  /** Shown as a primary action once the user's actually read the full text here -- see notification-entity-link.util. */
  get hasDeepLink(): boolean {
    return notificationHasDeepLink(this.data);
  }

  markAsRead() {
    this.notificationService.markAsRead(this.data.id).subscribe({
      next: () => {
        this.emitEVent.emit();
        this.dialogRef.close(true);
      },
      error: (error) => {
        this.responseMessage = error.error?.message || genericError;
      }
    });
  }

  /** "Go there" -- now that they've read the full notification, take them to what it's about. Marks read the same way closing the dialog already does. */
  goToEntity(): void {
    navigateToNotificationEntity(this.router, this.data);
    this.notificationService.markAsRead(this.data.id).subscribe();
    this.emitEVent.emit();
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(true);
  }
}
