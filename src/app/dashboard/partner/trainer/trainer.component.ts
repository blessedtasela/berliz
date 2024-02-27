import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Trainers } from 'src/app/models/trainers.interface';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';
import { Users } from 'src/app/models/users.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { Partners } from 'src/app/models/partners.interface';
import { Subscriber, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fileValidator, genericError } from 'src/validators/form-validators.module';
import { TrainerService } from 'src/app/services/trainer.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UpdateTrainerModalComponent } from 'src/app/admin/trainers/update-trainer-modal/update-trainer-modal.component';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.css']
})
export class TrainerComponent {
  @Input() trainerData!: Trainers;
  @Input() user!: Users;
  @Input() partnerData!: Partners;
  @Output() onEmit = new EventEmitter;
  subscriptions: Subscription[] = [];
  responseMessage: any;
  invalidForm: boolean = false;
  selectedImage: any;
  updateTrainerPhotoForm!: FormGroup;

  constructor(
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private trainerStateService: TrainerStateService,
    private partnerStateService: PartnerStateService,
    private datePipe: DatePipe,
    private trainerService: TrainerService,
    private snackBarService: SnackBarService,
    private formbuilder: FormBuilder,) { }

    ngOnInit(): void {
      this.updateTrainerPhotoForm = this.formbuilder.group({
        'photo': ['', [Validators.required, fileValidator]],
        'id': [this.trainerData.id],
      })
    }
    

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe())
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.subscriptions.push(
      this.trainerStateService.getTrainer().subscribe((trainer) => {
        this.trainerData = trainer;
        this.trainerStateService.setTrainerSubject(trainer)
      }),
      this.partnerStateService.getPartner().subscribe((partner) => {
        this.partnerData = partner;
        this.partnerStateService.setPartnerSubject(this.partnerData);
      }),
    );
    this.ngxService.stop();
  }

  emitData(): void {
    this.handleEmitEvent()
    console.log('data emitted: ')
  }

  openUpdateTrainer() {
    const dialogRef = this.dialog.open(UpdateTrainerModalComponent, {
      width: '800px',
      data: {
        trainerData: this.trainerData,
      },
      panelClass: 'mat-dialog-height',
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateTrainerModalComponent;
    childComponentInstance.onUpdateTrainerEmit.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updating partner');
      }
    });
  }

  openUpdateCoverPhoto() {
    const dialogRef = this.dialog.open(UpdateTrainerPhotoModalComponent, {
      width: '400px',
      data: {
        trainerData: this.trainerData,
      },
      panelClass: 'mat-dialog-height',
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateTrainerPhotoModalComponent;
    childComponentInstance.onUpdatePhotoEmit.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updating partner');
      }
    });
  }

  onImgSelected(event: any): void {
    this.selectedImage = event.target.files[0];
    console.log("onSelectedImage", this.selectedImage)
    this.submitForm()
  }

  submitForm(): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('id', this.updateTrainerPhotoForm.get('id')?.value);
    requestData.append('photo', this.selectedImage);
    this.trainerService.updatePhoto(requestData)
      .subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
          this.onEmit.emit()
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, 'error');
        });
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }


  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

}
