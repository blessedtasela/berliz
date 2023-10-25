import { Component, ElementRef, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Partners } from 'src/app/models/partners.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { genericError } from 'src/validators/form-validators.module';
import { PartnerDetailsComponent } from '../partner-details/partner-details.component';
import { UpdatePartnerModalComponent } from '../update-partner-modal/update-partner-modal.component';
import { DatePipe } from '@angular/common';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { ViewCertificateModalComponent } from 'src/app/shared/view-certificate-modal/view-certificate-modal.component';
import { ViewCvModalComponent } from 'src/app/shared/view-cv-modal/view-cv-modal.component';
import { PartnerStateService } from 'src/app/services/partner-state.service';

@Component({
  selector: 'app-partner-list',
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.css']
})
export class PartnerListComponent {
  responseMessage: any;
  @Input() partnersData: Partners[] = [];
  @Input() totalPartners: number = 0
  showFullData: boolean = false;

  constructor(private partnerService: PartnerService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private partnerStateService: PartnerStateService,
    private datePipe: DatePipe) { }

  ngOnInit(): void {

  }

  handleEmitEvent() {
    this.partnerStateService.getAllPartners().subscribe((partnersData) => {
      this.ngxService.start();
      this.partnersData = partnersData
      this.partnerStateService.setAllPartnersSubject(this.partnersData);
      this.ngxService.stop();
    });
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openUpdatePartner(id: number) {
    try {
      const partner = this.partnersData.find(partner => partner.id === id);
      if (partner) {
        const dialogRef = this.dialog.open(UpdatePartnerModalComponent, {
          width: '800px',
          data: {
            partnerData: partner,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdatePartnerModalComponent;

        // Set the event emitter before closing the dialog
        childComponentInstance.onUpdatePartnerEmit.subscribe(() => {
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


  updatePartnerStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const partner = this.partnersData.find(partner => partner.id === id);
    const message = partner?.status === 'false'
      ? 'activate this partner\'s as a ' + partner.role
      : 'deactivate this partner\'s account?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.partnerService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('Partner status updated successfully');
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

  openPartnerDetails(id: number) {
    const partner = this.partnersData.find(partner => partner.id === id);
    if (partner) {
      const dialogRef = this.dialog.open(PartnerDetailsComponent, {
        width: '800px',
        data: {
          partnerData: partner,
        },
        panelClass: 'mat-dialog-height',
      });
      const childComponentInstance = dialogRef.componentInstance as PartnerDetailsComponent;
      const sub = dialogRef.componentInstance.onRejectApplicationEmit.subscribe((res: any) => {
        this.handleEmitEvent();
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without any action');
        }
      });
    }
  }

  deletePartner(id: number) {
    const partner = this.partnersData.find(partner => partner.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "delete this partner. This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.partnerService.deletePartner(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('Partner deleted successfully');
          this.handleEmitEvent();
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

  openViewCertificate(id: number) {
    const partner = this.partnersData.find(partner => partner.id === id);
    const certificate = partner?.certificate;
    if (partner) {
      const dialogRef = this.dialog.open(ViewCertificateModalComponent, {
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
  }

  openViewCV(id: number) {
    const partner = this.partnersData.find(partner => partner.id === id);
    const cv = partner?.cv;
    if (partner) {
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
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}

