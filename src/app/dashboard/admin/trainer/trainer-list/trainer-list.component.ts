import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { TrainerService } from 'src/app/services/trainer.service';
import { TrainerDetailsComponent } from '../trainer-details/trainer-details.component';
import { UpdateTrainerModalComponent } from 'src/app/shared/update-trainer-modal/update-trainer-modal.component';
import { AddTrainerComponent } from '../add-trainer/add-trainer.component';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';
import { TrainerStateService } from 'src/app/services/trainer-state.service';

@Component({
  selector: 'app-trainer-list',
  templateUrl: './trainer-list.component.html',
  styleUrls: ['./trainer-list.component.css']
})
export class TrainerListComponent implements OnInit {
  @Input() trainersData: Trainers[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  @Input() totalTrainers: number = 0;

  constructor(private trainerStateService: TrainerStateService,
    private trainerService: TrainerService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe) { }

  ngOnInit(): void {
  }

  handleEmitEvent() {
    this.trainerStateService.getAllTrainers().subscribe((trainer) => {
      this.ngxService.start();
      this.trainersData = trainer;
      this.totalTrainers = this.trainersData.length;
      this.trainerStateService.setAllTrainersSubject(this.trainersData);
      this.ngxService.stop();
    });
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }


  openUpdateTrainer(id: number) {
    try {
      const trainer = this.trainersData.find(partner => partner.id === id);
      if (trainer) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '800px',
          dialogConfig.height = '600px',
          dialogConfig.data = { trainerData: trainer }
        const dialogRef = this.dialog.open(UpdateTrainerModalComponent, dialogConfig);
        const childComponentInstance = dialogRef.componentInstance as UpdateTrainerModalComponent;

        // Set the event emitter before closing the dialog
        childComponentInstance.onUpdateTrainerEmit.subscribe(() => {
          this.handleEmitEvent();
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without adding a category');
          }
        });
      } else {
        this.snackbarService.openSnackBar('partner not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check partner status", 'error');
    }
  }

  openTrainerDetails(id: number) {
    const trainer = this.trainersData.find(partner => partner.id === id);
    if (trainer) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '800px',
        dialogConfig.height = '600px',
        dialogConfig.data = { trainerData: trainer }
      const dialogRef = this.dialog.open(TrainerDetailsComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without any action');
        }
      });
    }
  }

  updateTrainerStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const trainer = this.trainersData.find(trainer => trainer.id === id);
    const message = trainer?.status === 'false'
      ? 'activate this trainer\'s account?'
      : 'deactivate this trainer\'s account?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.trainerService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('Trainer status updated successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without updating trainer status');
            }
          })
        })
    }, (error) => {
      this.ngxService.stop();
      this.snackbarService.openSnackBar(error, 'error');
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, 'error');
    });
  }

  deleteTrainer(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this trainer? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.trainerService.deleteTrainer(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('Trainer deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting trainer');
            }
          })
        })
    }, (error) => {
      this.ngxService.stop();
      this.snackbarService.openSnackBar(error, 'error');
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, 'error');
    });
  }

  openUpdatePhoto(id: number) {
    try {
      const trainer = this.trainersData.find(trainer => trainer.id === id);
      if (trainer) {
        const dialogRef = this.dialog.open(UpdateTrainerPhotoModalComponent, {
          width: '600px',
          data: {
            trainerData: trainer,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateTrainerPhotoModalComponent;

        // Set the event emitter before closing the dialog
        childComponentInstance.onUpdatePhotoEmit.subscribe(() => {
          this.handleEmitEvent()
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without updating trainer photo');
          }
        });
      }
      else {
        this.snackbarService.openSnackBar('trainer not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check trainer status", 'error');
    }
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}

