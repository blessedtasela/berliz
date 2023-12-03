import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { MuscleGroupStateService } from 'src/app/services/muscle-group-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';

@Component({
  selector: 'app-muscle-group-details-modal',
  templateUrl: './muscle-group-details-modal.component.html',
  styleUrls: ['./muscle-group-details-modal.component.css']
})
export class MuscleGroupDetailsModalComponent {
  onEmit = new EventEmitter();
  muscleGroupData!: MuscleGroups;
  responseMessage: any;
  subscriptions: Subscription[] = []

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<MuscleGroupDetailsModalComponent>,
    private muscleGroupStateService: MuscleGroupStateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private datePipe: DatePipe) {
    this.muscleGroupData = this.data.muscleGroupData;
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()))
  }

  handleEmit() {
    this.ngxService.start();
    this.subscriptions.push(
      this.muscleGroupStateService.getMuscleGroups().subscribe((muscleGroups) => {
        const muscleGroup = muscleGroups.find(muscleGroup => muscleGroup.id == this.muscleGroupData.id);
        if (muscleGroup)
          this.muscleGroupData = muscleGroup
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
          muscleGroupData: this.muscleGroupData,
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
