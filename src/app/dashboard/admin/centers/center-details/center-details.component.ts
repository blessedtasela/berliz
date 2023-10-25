import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';

@Component({
  selector: 'app-center-details',
  templateUrl: './center-details.component.html',
  styleUrls: ['./center-details.component.css']
})
export class CenterDetailsComponent {
  onEmit = new EventEmitter();
  centerData!: Centers;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();
  subscriptions: Subscription[] = []

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CenterDetailsComponent>,
    private centerStateService: CenterStateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
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
    this.ngxService.start();
    this.subscriptions.push(
      this.centerStateService.getAllCenters().subscribe((centers) => {
        const center = centers.find(center => center.id == this.centerData.id);
        if (center)
          this.centerData = center
      }),
    );
    this.ngxService.stop();
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
