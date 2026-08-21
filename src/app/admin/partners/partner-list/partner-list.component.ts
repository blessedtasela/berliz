import { Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Partner } from 'src/app/models/partners.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { genericError } from 'src/validators/form-validators.module';
import { UpdatePartnerModalComponent } from '../update-partner-modal/update-partner-modal.component';
import { DatePipe } from '@angular/common';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { ViewCertificateModalComponent } from 'src/app/shared/view-certificate-modal/view-certificate-modal.component';
import { ViewCvModalComponent } from 'src/app/shared/view-cv-modal/view-cv-modal.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { PartnerDetailsModalComponent } from '../partner-details-modal/partner-details-modal.component';
import { Store } from '@ngrx/store';
import { loadPartners } from 'src/app/state/partner/partner.actions';
import { selectPartners } from 'src/app/state/partner/partner.selectors';

@Component({
  selector: 'app-partner-list',
  templateUrl: './partner-list.component.html',
  styleUrls: ['./partner-list.component.css']
})
export class PartnerListComponent implements OnDestroy {
  responseMessage: any;
  @Input() partnersData: Partner[] = [];
  @Input() totalPartners: number = 0
  showFullData: boolean = false;

  private subscriptions: Subscription[] = [];

  constructor(private partnerService: PartnerService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private store: Store,
    private datePipe: DatePipe,
    private rxStompService: RxStompService,
    private router: Router) { }

  ngOnInit(): void {
    this.watchRejectPartnerApplication()
    this.watchUpdatePartner()
    this.watchUpdatePartnerStatus()
    this.watchUpdatePartnerFile()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent() {
    this.store.dispatch(loadPartners());
    this.store.select(selectPartners).subscribe((partnersData) => {
      this.partnersData = partnersData
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
          width: '560px',
          maxWidth: '95vw',
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
    this.router.navigate(['/dashboard/partners', id]);
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
    if (partner) {
      const dialogRef = this.dialog.open(ViewCertificateModalComponent, {
        width: '720px',
        maxWidth: '95vw',
        data: {
          partnerData: partner,
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
    if (partner) {
      const dialogRef = this.dialog.open(ViewCvModalComponent, {
        width: '720px',
        maxWidth: '95vw',
        data: {
          partnerData: partner,
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

  watchUpdatePartner() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/updatePartner').subscribe((message) => {
        const receivedPartner: Partner = JSON.parse(message.body);
        const partnerId = this.partnersData.findIndex(partners => partners.id === receivedPartner.id)
        this.partnersData[partnerId] = receivedPartner
      })
    );
  }

  watchUpdatePartnerStatus() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/updatePartnerStatus').subscribe((message) => {
        const receivedPartner: Partner = JSON.parse(message.body);
        const partnerId = this.partnersData.findIndex(partners => partners.id === receivedPartner.id)
        this.partnersData[partnerId] = receivedPartner
      })
    );
  }

  watchRejectPartnerApplication() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/rejectPartnerApplication').subscribe((message) => {
        const response = message.body;
        this.snackbarService.openSnackBar(response, '');
      })
    );
  }

  watchUpdatePartnerFile() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/updatePartnerFile').subscribe((message) => {
        const receivedPartner: Partner = JSON.parse(message.body);
        const partnerId = this.partnersData.findIndex(partners => partners.id === receivedPartner.id)
        this.partnersData[partnerId] = receivedPartner
      })
    );
  }

}

