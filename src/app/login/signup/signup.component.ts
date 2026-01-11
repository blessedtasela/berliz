import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { LocationFormComponent } from 'src/app/shared/location-form/location-form.component';
import {
  emailExtensionValidator,
  passwordMatchValidator,
  genericError,
  imageValidator
} from 'src/validators/form-validators.module';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm!: FormGroup;
  invalidForm = false;
  formIndex = 0;
  responseMessage: string = '';
  selectedImage: File | null = null;
  imagePreview: string = '';
  @ViewChild(LocationFormComponent) locationFormComponent!: LocationFormComponent;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService
  ) { }

  ngOnInit(): void {
    this.formIndex = this.getIndex();

    this.signupForm = this.fb.group(
      {
        firstname: ['', [Validators.required, Validators.minLength(2)]],
        lastname: ['', [Validators.required, Validators.minLength(2)]],
        gender: ['', Validators.required],
        dob: ['', Validators.required],
        profilePhoto: ['', [Validators.required, imageValidator()]],

        location: this.fb.group({
          country: [null, Validators.required],
          state: [null, Validators.required],
          city: [null, Validators.required],
          countryCode: [null, Validators.required],
          postalCode: ['', [Validators.required, Validators.minLength(5)]],
          address: ['', [Validators.required, Validators.minLength(8)]],
          phone: ['', [Validators.required, Validators.minLength(8)]]
        }),

        email: [
          '',
          [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]
        ],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
      },
      { validator: passwordMatchValidator }
    );
  }

  f(name: string): AbstractControl {
    return this.signupForm.get(name)!;
  }

  isStepValid(step: number): boolean {
    if (step === 0) {
      return (
        this.f('firstname').valid &&
        this.f('lastname').valid &&
        this.f('gender').valid &&
        this.f('dob').valid &&
        this.f('profilePhoto').valid
      );
    }
    if (step === 1) {
      return this.signupForm.get('location')?.valid ?? false;
    }
    return (
      this.f('email').valid &&
      this.f('password').valid &&
      this.f('confirmPassword').valid &&
      !this.signupForm.hasError('passwordMismatch')
    );
  }

  handleNextOrSubmit(): void {
    this.invalidForm = !this.isStepValid(this.formIndex);
    if (this.invalidForm) return;

    if (this.formIndex < 2) {
      this.formIndex++;
      this.userService.setSignupFormIndex(this.formIndex);
    } else {
      this.submitForm();
    }
  }

  get locationForm(): FormGroup {
    return this.signupForm.get('location') as FormGroup;
  }

  prevStep(): void {
    if (this.formIndex > 0) {
      this.formIndex--;
      this.userService.setSignupFormIndex(this.formIndex);
      this.invalidForm = false;
    }
  }

  getIndex(): number {
    const stored = localStorage.getItem('signUpFormIndex');
    return stored ? +stored : 0;
  }

  onImgSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    this.selectedImage = file;
    this.signupForm.patchValue({ profilePhoto: file });
    const control = this.signupForm.get('profilePhoto')!;
    control.markAsTouched();
    control.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    if (this.imagePreview) {
      URL.revokeObjectURL(this.imagePreview);
      this.imagePreview = '';
    }
    this.selectedImage = null;
    this.signupForm.patchValue({ profilePhoto: null });
    const control = this.signupForm.get('profilePhoto')!;
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  submitForm(): void {
    if (this.signupForm.invalid) {
      this.invalidForm = true;
      this.snackBarService.openSnackBar('Please complete all sections', 'error');
      return;
    }

    this.ngxService.start();
    //  const fullPhone = this.locationFormComponent.getFullPhoneNumber();
    const data = new FormData();
    Object.keys(this.signupForm.controls).forEach(key => {
      const value = this.f(key).value;
      if (key === 'profilePhoto') {
        data.append(key, this.selectedImage!);
      } else if (key === 'location') {
        Object.entries(value).forEach(([k, v]) => data.append(k, v as string));
      } else {
        data.append(key, value);
      }
    });

    console.log('Submitting signup data:', data);
    this.userService.signup(data).subscribe(
      (resp: any) => {
        this.snackBarService.openSnackBar(resp.message, '');
        this.router.navigate(['/login']);
        this.ngxService.stop();
      },
      err => {
        this.responseMessage = err.error?.message || genericError;
        this.snackBarService.openSnackBar(this.responseMessage, 'error');
        this.ngxService.stop();
      }
    );
  }



  clear() {
    this.signupForm.reset();
    this.formIndex = 0;
    this.userService.removeSignupFormIndex(this.formIndex);
  }
}