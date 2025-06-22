import { Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { fileValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center-partner-form',
  templateUrl: './center-partner-form.component.html',
  styleUrls: ['./center-partner-form.component.css']
})
export class CenterPartnerFormComponent {
  onAddPartnerEmit = new EventEmitter();
  addPartnerForm!: FormGroup;
  invalidForm: boolean = false;
  user!: Users;
  responseMessage: any;
  selectedCV: any;
  selectedCertificate: any;

  constructor(private fb: FormBuilder,
    private userStateService: UserStateService,
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
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
    });
  }

  onCertificateSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedCertificate = file.name;
      this.addPartnerForm.get('certificate')?.setValue(file);
    }
  }

  onCVSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedCV = file.name;
      this.addPartnerForm.get('cv')?.setValue(file);
    }
  }

  addPartner(): void {
    const requestData = new FormData();
    requestData.append('email', this.user?.email);
    requestData.append('certificate', this.addPartnerForm.get('certificate')?.value);
    requestData.append('motivation', this.addPartnerForm.get('motivation')?.value);
    requestData.append('cv', this.addPartnerForm.get('cv')?.value);
    requestData.append('facebookUrl', this.addPartnerForm.get('facebookUrl')?.value);
    requestData.append('instagramUrl', this.addPartnerForm.get('instagramUrl')?.value);
    requestData.append('youtubeUrl', this.addPartnerForm.get('youtubeUrl')?.value);
    requestData.append('role', this.addPartnerForm.get('role')?.value);

    if (this.addPartnerForm.invalid) {
      this.responseMessage = '';
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all required sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
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
    this.selectedCV = null;
    this.selectedCertificate = null;
    this.invalidForm = false;
  }
}
