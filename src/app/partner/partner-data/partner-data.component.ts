import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { UpdatePartnerFileModalComponent } from 'src/app/admin/partners/update-partner-file-modal/update-partner-file-modal.component';
import { Partners } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Role } from 'src/app/models/users.interface';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ViewCvModalComponent } from 'src/app/shared/view-cv-modal/view-cv-modal.component';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-partner-data',
  templateUrl: './partner-data.component.html',
  styleUrls: ['./partner-data.component.css']
})
export class PartnerDataComponent {
  @Input() partnerData!: Partners;
  @Output() onEmit = new EventEmitter;
  updatePartnerForm!: FormGroup;
  invalidForm: boolean = false;
  formIndex: number = 0;
  responseMessage: any;
  subscriptions: Subscription[] = []
  roles: Role[] = [{
    id: 1, role: 'center'
  }, {
    id: 2, role: 'trainer'
  },]

  constructor(private datePipe: DatePipe,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private formBuilder: FormBuilder,
    private partnerService: PartnerService,
    private partnerStateService: PartnerStateService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.updatePartnerForm = this.formBuilder.group({
      'id': this.partnerData?.id,
      'motivation': [this.partnerData?.motivation, Validators.compose([Validators.required, Validators.minLength(9)])],
      'facebookUrl': [this.partnerData?.facebookUrl, Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?facebook\\.com\\/.+$')])],
      'instagramUrl': [this.partnerData?.instagramUrl, Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/.+$')])],
      'youtubeUrl': [this.partnerData?.youtubeUrl, Validators.pattern('^(https?:\\/\\/)?(www\\.)?youtube\\.com\\/.+$')],
      'role': [this.partnerData?.role, [Validators.required, Validators.minLength(3)]],
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start();
    console.log('cached false: ')
    this.subscriptions.push(this.partnerStateService.getPartner().subscribe((partner) => {
      this.partnerData = partner;
      this.partnerStateService.setPartnerSubject(this.partnerData);
      this.cd.detectChanges();
    }),
    );
    this.ngxService.stop();
  }

  updateFormValues(partner: Partners) {
    this.updatePartnerForm.patchValue({
      id: partner.id,
      motivation: partner.motivation,
      role: partner.role,
      facebookUrl: partner.facebookUrl,
      instagramUrl: partner.instagramUrl,
      youtubeUrl: partner.youtubeUrl
    });
  }
  openUrl(url: any) {
    window.open(url, '_blank');
  }

  openViewCV() {
    const cv = 'data:application/pdf;base64,' + this.partnerData?.cv;
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
    const certificate = 'data:application/pdf;base64,' + this.partnerData?.certificate;
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

  openUpdateFile() {
    const dialogRef = this.dialog.open(UpdatePartnerFileModalComponent, {
      width: '500px',
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

  updatePartner(): void {
    if (this.updatePartnerForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form";
      return;
    } else {
      this.partnerService.updatePartner(this.updatePartnerForm.value)
        .subscribe((response: any) => {
          this.ngxService.start();
          this.updatePartnerForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.onEmit.emit();
          this.updateFormValues(this.updatePartnerForm.value);
          this.ngxService.stop();
        }, (error: any) => {
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
        });
    }
    this.ngxService.stop();
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }

  clear() {
    this.updatePartnerForm.reset();
  }

}
