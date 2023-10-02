import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partners } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { PartnerDataService } from 'src/app/services/partner-data.service';
import { TrainerDataService } from 'src/app/services/trainer-data.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { CenterFormModalComponent } from 'src/app/shared/center-form-modal/center-form-modal.component';
import { TrainerFormModalComponent } from 'src/app/shared/trainer-form-modal/trainer-form-modal.component';
import { UpdateTrainerModalComponent } from 'src/app/shared/update-trainer-modal/update-trainer-modal.component';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';
import { ViewCvModalComponent } from 'src/app/shared/view-cv-modal/view-cv-modal.component';
import { UpdatePartnerFileModalComponent } from '../../admin/partners/update-partner-file-modal/update-partner-file-modal.component';
import { UpdatePartnerModalComponent } from '../../admin/partners/update-partner-modal/update-partner-modal.component';
import { Users } from 'src/app/models/users.interface';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.css']
})
export class TrainerComponent {

  trainerData!: Trainers;
  user!: Users;
  responseMessage: any;

  constructor(
    private userDataService: UserDataService,
    private partnerDataService: PartnerDataService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private trainerDataService: TrainerDataService,
    private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.userDataService.getUser().subscribe(() => {
      this.user = this.userDataService.userData;
    });
    this.trainerDataService.getTrainer().subscribe(() => {
      this.trainerData = this.trainerDataService.trainerData;
    });
    this.ngxService.stop();
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
    
  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }
  
}
