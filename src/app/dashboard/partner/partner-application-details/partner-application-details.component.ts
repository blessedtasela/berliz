import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partners } from 'src/app/models/partners.interface';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { Users } from 'src/app/models/users.interface';
import { DatePipe } from '@angular/common';
import { UpdatePartnerFileModalComponent } from '../../admin/partners/update-partner-file-modal/update-partner-file-modal.component';
import { UpdatePartnerModalComponent } from '../../admin/partners/update-partner-modal/update-partner-modal.component';
import { TrainerFormModalComponent } from 'src/app/shared/trainer-form-modal/trainer-form-modal.component';
import { CenterFormModalComponent } from 'src/app/shared/center-form-modal/center-form-modal.component';
import { Trainers } from 'src/app/models/trainers.interface';
import { ViewCvModalComponent } from 'src/app/shared/view-cv-modal/view-cv-modal.component';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { UserStateService } from 'src/app/services/user-state.service';

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

  constructor(
    private userStateService: UserStateService,
    private partnerDataService: PartnerStateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
    });
    this.partnerDataService.getPartner().subscribe((partnerData) => {
      this.partnerData = partnerData; 
    });
    this.trainerStateService.getTrainer().subscribe((trainer) => {
      this.trainerData = trainer;
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
