import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Partners } from 'src/app/models/partners.interface';
import { Users } from 'src/app/models/users.interface';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { CenterFormModalComponent } from 'src/app/shared/center-form-modal/center-form-modal.component';
import { TrainerFormModalComponent } from 'src/app/shared/trainer-form-modal/trainer-form-modal.component';
import { fileValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-null-partner',
  templateUrl: './null-partner.component.html',
  styleUrls: ['./null-partner.component.css']
})
export class NullPartnerComponent {
  @Input() user!: Users;
  @Input() partnerData!: Partners;
  responseMessage: any;
  invalidForm: boolean = false;
  addPartnerForm!: FormGroup;
  selectedCV: any;
  selectedCertificate: any;
  subscriptions: Subscription[] = [];

  constructor(
    private userStateService: UserStateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private snackbarService: SnackBarService,
    private partnerService: PartnerService,
    private partnerStateService: PartnerStateService) { }

  ngOnInit(): void {
    this.addPartnerForm = this.formBuilder.group({
      'certificate': ['', Validators.compose([Validators.required, fileValidator])],
      'motivation': ['', Validators.compose([Validators.required, Validators.minLength(9)])],
      'cv': ['', Validators.compose([Validators.required, fileValidator])],
      'facebookUrl': ['', Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?facebook\\.com\\/.+$')])],
      'instagramUrl': ['', Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/.+$')])],
      'youtubeUrl': ['', Validators.pattern('^(https?:\\/\\/)?(www\\.)?youtube\\.com\\/.+$')],
      'role': ['trainer'],
    });
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.subscriptions.push(
      this.userStateService.getUser().subscribe((user) => {
        this.user = user;
        this.userStateService.setUserSubject(user);
      }),
      this.partnerStateService.getPartner().subscribe((partner) => {
        this.partnerData = partner
        this.partnerStateService.setPartnerSubject(partner);
      })
    );
    this.ngxService.stop();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  emitPartner(): void {
    this.handleEmitEvent()
  }


  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  onCVSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedCV = event.target.files[0];
    }
  }

  onCertificateSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedCertificate = event.target.files[0];
    }
  }

  addPartner(): void {
    const requestData = new FormData();
    requestData.append('email', this.user?.email);
    requestData.append('certificate', this.selectedCertificate);
    requestData.append('motivation', this.addPartnerForm.get('motivation')?.value);
    requestData.append('cv', this.selectedCV);
    requestData.append('facebookUrl', this.addPartnerForm.get('facebookUrl')?.value);
    requestData.append('instagramUrl', this.addPartnerForm.get('instagramUrl')?.value);
    requestData.append('youtubeUrl', this.addPartnerForm.get('youtubeUrl')?.value);
    requestData.append('role', this.addPartnerForm.get('role')?.value);

    if (this.addPartnerForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackbarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.partnerService.addPartner(requestData)
        .subscribe((response: any) => {
          this.addPartnerForm.reset();
          this.partnerService.setPartnerFormIndex(0);
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.handleEmitEvent();
        }, (error: any) => {
          this.ngxService.start();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        })
    }
  }

  clear() {
    this.addPartnerForm.reset();
  }
}
