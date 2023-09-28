import { Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Role, Users } from 'src/app/models/users.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserDataService } from 'src/app/services/user-data.service';
import { fileValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-trainer-partner-form',
  templateUrl: './trainer-partner-form.component.html',
  styleUrls: ['./trainer-partner-form.component.css']
})
export class TrainerPartnerFormComponent {
  onAddPartnerEmit = new EventEmitter();
  addPartnerForm!: FormGroup;
  invalidForm: boolean = false;
  user!: Users;
  responseMessage: any;
  selectedCV: any;
  selectedCertificate: any;

  constructor(private fb: FormBuilder,
    private userDataService: UserDataService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private partnerService: PartnerService,) { }

  ngOnInit(): void {
    this.addPartnerForm = this.fb.group({
      'certificate': ['', Validators.compose([Validators.required, fileValidator])],
      'motivation': ['', Validators.compose([Validators.required, Validators.minLength(9)])],
      'cv': ['', Validators.compose([Validators.required, fileValidator])],
      'facebookUrl': ['', Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?facebook\\.com\\/.+$')])],
      'instagramUrl': ['', Validators.compose([Validators.required, Validators.pattern('^(https?:\\/\\/)?(www\\.)?instagram\\.com\\/.+$')])],
      'youtubeUrl': ['', Validators.pattern('^(https?:\\/\\/)?(www\\.)?youtube\\.com\\/.+$')],
      'role': ['trainer'],
    });

    this.handleEmitEvent();
  }

  handleEmitEvent() {
    this.userDataService.getUser().subscribe(() => {
      this.user = this.userDataService.userData;
    });
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
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.partnerService.addPartner(requestData)
        .subscribe((response: any) => {
          this.addPartnerForm.reset();
          this.partnerService.setPartnerFormIndex(0);
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onAddPartnerEmit.emit();
        }, (error: any) => {
          this.ngxService.start();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        })
    }
  }

  clear() {
    this.addPartnerForm.reset();
  }
}
