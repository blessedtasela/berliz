import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';
import { selectCenters } from 'src/app/state/center/center.selectors';

@Component({
  selector: 'app-center-details-modal',
  templateUrl: './center-details-modal.component.html',
  styleUrls: ['./center-details-modal.component.css']
})
export class CenterDetailsModalComponent {
  onEmit = new EventEmitter();
  centerData!: Centers;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();
  subscriptions: Subscription[] = []

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CenterDetailsModalComponent>,
    private store: Store,
    private dialog: MatDialog,
    private snackbarService: SnackBarService,
    private datePipe: DatePipe) {
    this.centerData = this.data.centerData;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()))
  }

  handleEmit() {
    this.subscriptions.push(
      this.store.select(selectCenters).subscribe((centers) => {
        const center = centers.find(center => center.id == this.centerData.id);
        if (center)
          this.centerData = center
      }),
    );
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

  openUpdatePhoto() {
    try {
      const dialogRef = this.dialog.open(UpdateTrainerPhotoModalComponent, {
        width: '600px',
        maxWidth: '95vw',
        data: {
          centerData: this.centerData,
        }
      });
      const childComponentInstance = dialogRef.componentInstance as UpdateTrainerPhotoModalComponent;
      childComponentInstance.onUpdatePhotoEmit.subscribe(() => {
        this.handleEmit()
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without updating file');
        }
      });
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check partner status", 'error');
    }
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

}
