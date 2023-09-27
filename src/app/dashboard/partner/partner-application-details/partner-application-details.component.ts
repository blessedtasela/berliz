import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partners } from 'src/app/models/partners.interface';
import { PartnerDataService } from 'src/app/services/partner-data.service';
import { Users } from 'src/app/models/users.interface';
import { UserDataService } from 'src/app/services/user-data.service';
import { DatePipe } from '@angular/common';
import { UpdatePartnerFileModalComponent } from '../../admin/partners/update-partner-file-modal/update-partner-file-modal.component';
import { UpdatePartnerModalComponent } from '../../admin/partners/update-partner-modal/update-partner-modal.component';
import { TrainerFormModalComponent } from 'src/app/shared/trainer-form-modal/trainer-form-modal.component';
import { CenterFormModalComponent } from 'src/app/shared/center-form-modal/center-form-modal.component';
import { Trainers } from 'src/app/models/trainers.interface';
import { TrainerDataService } from 'src/app/services/trainer-data.service';
import { ViewCvModalComponent } from 'src/app/shared/view-cv-modal/view-cv-modal.component';

@Component({
  selector: 'app-partner-application-details',
  templateUrl: './partner-application-details.component.html',
  styleUrls: ['./partner-application-details.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class PartnerApplicationDetailsComponent {
  partnerData!: Partners;
  trainerData!: Trainers;
  user!: Users;
  responseMessage: any;
  profilePhoto: any;

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
    this.partnerDataService.getPartner().subscribe((partnerData) => {
      this.partnerData = partnerData; 
    });
    this.trainerDataService.getTrainer().subscribe(() => {
      this.trainerData = this.trainerDataService.trainerData;
      console.log('trainer: ', this.trainerData); 
    });
    this.ngxService.stop();
  }
  

  openUpdatePartner() {
    const dialogRef = this.dialog.open(UpdatePartnerModalComponent, {
      width: '800px',
      data: {
        partnerData: this.partnerData,
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdatePartnerModalComponent;
    childComponentInstance.onUpdatePartnerEmit.subscribe(() => {
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

  openUpdateFile() {
    const dialogRef = this.dialog.open(UpdatePartnerFileModalComponent, {
      width: '800px',
      data: {
        partnerData: this.partnerData,
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdatePartnerFileModalComponent;
    childComponentInstance.onUpdatePartnerFileEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updating file');
      }
    });
  }

  openApplicagtionForm() {
    if (this.partnerData.role === 'trainer') {
      const dialogRef = this.dialog.open(TrainerFormModalComponent, {
        width: '800px',
        data: {
          partnerData: this.partnerData,
        },
        panelClass: 'mat-dialog-height',
      });
      const childComponentInstance = dialogRef.componentInstance as TrainerFormModalComponent;
      childComponentInstance.onAddTrainerEmit.subscribe(() => {
        this.handleEmitEvent()
      });
    }
    if (this.partnerData.role === 'center') {
      const dialogRef = this.dialog.open(CenterFormModalComponent, {
        width: '800px',
        data: {
          partnerData: this.partnerData,
        },
        panelClass: 'mat-dialog-height',
      });
      const childComponentInstance = dialogRef.componentInstance as CenterFormModalComponent;
      childComponentInstance.onAddCenterEmit.subscribe(() => {
        this.handleEmitEvent()
      });
    }
  }

  openUpdateTrainer() {
    const dialogRef = this.dialog.open(UpdatePartnerModalComponent, {
      width: '800px',
      data: {
        trainerData: this.trainerData,
      }
    });
    const childComponentInstance = dialogRef.componentInstance as UpdatePartnerModalComponent;
    childComponentInstance.onUpdatePartnerEmit.subscribe(() => {
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

  openViewCV() {
    const cv = 'data:application/pdf;base64,' +this.partnerData?.cv;
      const dialogRef = this.dialog.open(ViewCvModalComponent, {
        width: '800px',
        data: {
          partnerData: cv,
        },
        panelClass: 'mat-dialog-height',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without any action');
        }
      });
    }

    openViewCertificate() {
      const certificate = 'data:application/pdf;base64,' +this.partnerData?.certificate;
        const dialogRef = this.dialog.open(ViewCvModalComponent, {
          width: '800px',
          data: {
            partnerData: certificate,
          },
          panelClass: 'mat-dialog-height',
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without any action');
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
