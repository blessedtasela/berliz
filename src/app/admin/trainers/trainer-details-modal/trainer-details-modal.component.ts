import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';
import { selectTrainers } from 'src/app/state/trainer/trainer.selector';

@Component({
  selector: 'app-trainer-details-modal',
  templateUrl: './trainer-details-modal.component.html',
  styleUrls: ['./trainer-details-modal.component.css']
})
export class TrainerDetailsModalComponent {
  onEmit = new EventEmitter();
  trainerData!: Trainers;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TrainerDetailsModalComponent>,
    private store: Store,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private datePipe: DatePipe) {
    this.trainerData = this.data.trainerData;
  }

  ngOnInit(): void {
  }

  handleEmit() {
    this.store.select(selectTrainers).subscribe((trainers) => {
      const trainer = trainers.find(trainer => trainer.id == this.trainerData.id);
      if (trainer)
        this.trainerData = trainer
    });
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
          trainerData: this.trainerData,
        }
      });
      const childComponentInstance = dialogRef.componentInstance as UpdateTrainerPhotoModalComponent;

      // Set the event emitter before closing the dialog
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
