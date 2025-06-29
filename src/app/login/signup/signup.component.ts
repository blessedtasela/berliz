import { Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CountryService } from 'src/app/services/country.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import {
  fileValidator,
  emailExtensionValidator,
  passwordMatchValidator,
  genericError
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
  countries: { name: string; states: string[] }[] = [];
  responseMessage: string = '';
  selectedImage: File | null = null;
  imagePreview: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private countryService: CountryService,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService
  ) { }

  ngOnInit(): void {
    this.formIndex = this.getIndex();
    this.getCountriesData();
    this.signupForm = this.fb.group(
      {
        firstname: ['', [Validators.required, Validators.minLength(2)]],
        lastname: ['', [Validators.required, Validators.minLength(2)]],
        phone: ['', [Validators.required, Validators.minLength(9)]],
        dob: ['', [
          Validators.required,
          Validators.pattern(/^[0-9]{8}$/)  // exactly 8 digits
        ]],
        gender: ['', Validators.required],
        country: ['', Validators.required],

        state: ['', [Validators.required, Validators.minLength(3)]],
        city: ['', [Validators.required, Validators.minLength(3)]],
        postalCode: ['', [Validators.required, Validators.minLength(5)]],
        address: ['', [Validators.required, Validators.minLength(8)]],
        profilePhoto: ['', [Validators.required, fileValidator]],

        email: [
          '',
          [
            Validators.required,
            Validators.email,
            emailExtensionValidator(['com', 'org'])
          ]
        ],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
      },
      { validator: passwordMatchValidator }
    );
  }

  // Shortcut to access form controls in template
  f(name: string): AbstractControl {
    return this.signupForm.get(name)!;
  }

  // Check if all fields in the given step are valid
  isStepValid(step: number): boolean {
    if (step === 0) {
      return (
        this.f('firstname').valid &&
        this.f('lastname').valid &&
        this.f('phone').valid &&
        this.f('dob').valid &&
        this.f('gender').valid &&
        this.f('country').valid
      );
    }
    if (step === 1) {
      return (
        this.f('state').valid &&
        this.f('city').valid &&
        this.f('postalCode').valid &&
        this.f('address').valid &&
        this.f('profilePhoto').valid
      );
    }
    // step === 2
    return (
      this.f('email').valid &&
      this.f('password').valid &&
      this.f('confirmPassword').valid
    );
  }

  // Called on form submit / Next button
  handleNextOrSubmit(): void {
    this.invalidForm = !this.isStepValid(this.formIndex);
    if (this.invalidForm) {
      // show top‑of‑section banner
      return;
    }
    // clear any banner
    this.invalidForm = false;

    if (this.formIndex < 2) {
      this.formIndex++;
      this.userService.setLoginFormIndex(this.formIndex);
    } else {
      this.submitForm();
    }
  }

  prevStep(): void {
    if (this.formIndex > 0) {
      this.formIndex--;
      this.userService.setLoginFormIndex(this.formIndex);
      this.invalidForm = false;
    }
  }

  getIndex(): number {
    const stored = localStorage.getItem('signUpFormIndex');
    return stored ? +stored : 0;
  }

  getCountriesData() {
    this.countryService.getCountriesData().subscribe(
      (res: any) => {
        if (res && res.length) {
          this.countries = res.map((c: any) => ({
            name: c.name.common,
            states: c.subdivisions ? Object.keys(c.subdivisions) : []
          }));
        } else {
          this.useFallbackCountries();
        }
      },
      err => {
        // network or API error
        this.useFallbackCountries();
      }
    );
  }

  // fallback hard‑coded list
  private useFallbackCountries() {
    this.countries = [
      { name: 'United States', states: ['California', 'New York', 'Texas'] },
      { name: 'Canada', states: ['Ontario', 'Quebec', 'British Columbia'] },
      { name: 'United Kingdom', states: ['England', 'Scotland', 'Wales'] },
      { name: 'Australia', states: ['New South Wales', 'Victoria', 'Queensland'] },
      { name: 'Germany', states: ['Bavaria', 'Berlin', 'Hesse'] }
    ];
  }



  onImgSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    // store file for backend
    this.selectedImage = file;

    // 1️⃣ patch into the form
    // this.signupForm.patchValue({ profilePhoto: file });

    // 2️⃣ re‑validate
    // const control = this.signupForm.get('profilePhoto')!;
    // control.markAsTouched();
    // control.updateValueAndValidity();


    // generate preview
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);

  }

  removeImage(): void {
    // clear preview & file
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
      return;
    }
    this.ngxService.start();
    const data = new FormData();
    Object.keys(this.signupForm.controls).forEach(key => {
      if (key === 'profilePhoto') {
        data.append(key, this.selectedImage!);
      } else {
        data.append(key, this.f(key).value);
      }
    });

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
    localStorage.removeItem('signUpFormIndex');
  }
}
