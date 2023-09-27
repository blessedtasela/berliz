import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partners } from 'src/app/models/partners.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { UpdatePartnerFileModalComponent } from '../update-partner-file-modal/update-partner-file-modal.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-partner-details',
  templateUrl: './partner-details.component.html',
  styleUrls: ['./partner-details.component.css']
})
export class PartnerDetailsComponent {
  partnerData!: Partners;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PartnerDetailsComponent>,
    private partnerService: PartnerService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private datePipe: DatePipe) {
    this.partnerData = this.data.partnerData;
  }

  ngOnInit(): void {

  }

  openUrl(url: any){
    window.open(url, '_blank');
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

  rejectApplication(id: number){
    const dialogConfig = new MatDialogConfig();
    const partner = this.partnerData;
    const message = 'reject this partner\'s  appliaction as a '+ partner.role;

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.partnerService.rejectApplication(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('Partner application rejected');
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

  openUpdateFile() {
    try {
        const dialogRef = this.dialog.open(UpdatePartnerFileModalComponent, {
          width: '600px',
          data: {
            partnerData: this.partnerData,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdatePartnerFileModalComponent;

        // Set the event emitter before closing the dialog
        childComponentInstance.onUpdatePartnerFileEmit.subscribe(() => {
          this.partnerData = this.data.partnerData;
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
