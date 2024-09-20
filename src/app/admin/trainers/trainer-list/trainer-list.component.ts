import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { UpdateTrainerModalComponent } from '../update-trainer-modal/update-trainer-modal.component';
import { TrainerDetailsModalComponent } from '../trainer-details-modal/trainer-details-modal.component';

@Component({
  selector: 'app-trainer-list',
  templateUrl: './trainer-list.component.html',
  styleUrls: ['./trainer-list.component.css']
})
export class TrainerListComponent {
  @Input() trainersData: Trainers[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  @Input() totalTrainers: number = 0;
  selectedImage: any;

  constructor(private trainerStateService: TrainerStateService,
    private trainerService: TrainerService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.watchLikeTrainer()
    this.watchUpdatePhoto()
    this.watchUpdateStatus()
    this.watchUpdateTrainer()
    this.ngxService.stop();
  }

  handleEmitEvent() {
    this.trainerStateService.getAllTrainers().subscribe((trainer) => {
      this.trainersData = trainer;
      this.totalTrainers = this.trainersData.length;
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
      dialogConfig.disableClose = false;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '800px',
        dialogConfig.height = '600px',
        dialogConfig.data = { trainerData: trainer }
      const dialogRef = this.dialog.open(TrainerDetailsModalComponent, dialogConfig);
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
          });
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
          });
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
    });
  }

  onImgSelected(event: any, id: number): void {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
      this.selectedImage = selectedImage;
      this.updatePhoto(id);
    }
  }

  updatePhoto(id: number): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('photo', this.selectedImage);
    requestData.append('id', id.toString());
    this.trainerService.updatePhoto(requestData)
      .subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchLikeTrainer() {
    this.rxStompService.watch('/topic/likeTrainer').subscribe((message) => {
      const receivedTrainer: Trainers = JSON.parse(message.body);
      const trainerId = this.trainersData.findIndex(trainer => trainer.id === receivedTrainer.id)
      this.trainersData[trainerId] = receivedTrainer
    });
  }

  watchUpdateTrainer() {
    this.rxStompService.watch('/topic/updateTrainer').subscribe((message) => {
      const receivedTrainer: Trainers = JSON.parse(message.body);
      const trainerId = this.trainersData.findIndex(trainer => trainer.id === receivedTrainer.id)
      this.trainersData[trainerId] = receivedTrainer
    });
  }

  watchUpdatePhoto() {
    this.rxStompService.watch('/topic/updatePhoto').subscribe((message) => {
      const receivedTrainer: Trainers = JSON.parse(message.body);
      const trainerId = this.trainersData.findIndex(trainer => trainer.id === receivedTrainer.id)
      this.trainersData[trainerId] = receivedTrainer
    });
  }

  watchUpdateStatus() {
    this.rxStompService.watch('/topic/updateTrainerStatus').subscribe((message) => {
      const receivedTrainer: Trainers = JSON.parse(message.body);
      const trainerId = this.trainersData.findIndex(trainer => trainer.id === receivedTrainer.id)
      this.trainersData[trainerId] = receivedTrainer
    });
  }
}

