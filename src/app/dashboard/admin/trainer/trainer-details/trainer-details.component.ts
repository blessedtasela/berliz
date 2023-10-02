import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';
import { Trainers } from 'src/app/models/trainers.interface';
import { TrainerDataService } from 'src/app/services/trainer-data.service';

@Component({
  selector: 'app-trainer-details',
  templateUrl: './trainer-details.component.html',
  styleUrls: ['./trainer-details.component.css']
})
export class TrainerDetailsComponent {
  onEmit = new EventEmitter();
  trainerData!: Trainers;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TrainerDetailsComponent>,
    private trainerDataService: TrainerDataService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private datePipe: DatePipe) {
    this.trainerData = this.data.trainerData;
  }

  ngOnInit(): void {
  }

  handleEmit() {
    this.trainerDataService.getAllTrainers().subscribe(() => {
      this.ngxService.start();
      const trainer = this.trainerDataService.trainersData.find(trainer => trainer.id == this.trainerData.id);
      if (trainer)
        this.trainerData = trainer
      this.ngxService.stop();
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
