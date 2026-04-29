import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject, takeUntil, merge } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { CountryService } from 'src/app/services/country.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { UpdateEmailModalComponent } from 'src/app/shared/update-email-modal/update-email-modal.component';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-user-profile-settings',
  templateUrl: './user-profile-settings.component.html',
  styleUrls: ['./user-profile-settings.component.css']
})
export class UserProfileSettingsComponent {
  user!: Users;
  responseMessage: any;
  updateUserForm!: FormGroup;
  invalidForm = false;
  countries: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private userStateService: UserStateService,
    private countryService: CountryService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private formbuilder: FormBuilder,
    private rxStompService: RxStompService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerWebsocketListeners();

    this.userStateService.userData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cached => {
        if (!cached) {
          this.refreshUser();
        } else {
          this.user = cached;
          if (!this.updateUserForm) this.initForm();
        }
      });

    this.getCountriesData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private registerWebsocketListeners() {
    const topics = [
      '/topic/activateAccount',
      '/topic/deleteUser',
      '/topic/updateUser',
      '/topic/updateUserBio',
      '/topic/updateUserEmail'
    ];

    merge(...topics.map(t => this.rxStompService.watch(t)))
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refreshUser());
  }

  private refreshUser() {
    this.userStateService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: user => {
          this.user = user;
          this.userStateService.setUserSubject(user);

          if (!this.updateUserForm) {
            this.initForm();
          } else {
            this.updateUserForm.patchValue(user);
          }

        },
        error: () => this.ngxService.stop()
      });
  }

  initForm(): void {
    this.updateUserForm = this.formbuilder.group({
      id: [this.user?.id],
      firstname: [this.user?.firstname, [Validators.required, Validators.minLength(2)]],
      lastname: [this.user?.lastname, [Validators.required, Validators.minLength(2)]],
      phone: [this.user?.phone, [Validators.required, Validators.minLength(9)]],
      postalCode: [this.user?.postalCode, [Validators.required, Validators.minLength(5)]],
      dob: [this.user?.dob, Validators.required],
      gender: [this.user?.gender, Validators.required],
      country: [this.user?.country, Validators.required],
      state: [this.user?.state, [Validators.required, Validators.minLength(3)]],
      city: [this.user?.city, [Validators.required, Validators.minLength(3)]],
      address: [this.user?.address, [Validators.required, Validators.minLength(8)]],
      bio: [this.user?.bio, [Validators.required, Validators.minLength(8)]],
      email: [this.user?.email, [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]]
    });
  }

  onGenderChange(selectedGender: string) {
    this.updateUserForm.get('gender')?.setValue(selectedGender);
  }

  getCountriesData() {
    this.countryService.getCountriesData()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.countries = response.map((country: any) => ({
          name: country.name.common,
          states: country?.subdivisions ? Object.keys(country.subdivisions) : []
        }));
      });
  }

  onSubmitForm() {
    this.ngxService.start();

    if (this.updateUserForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = 'Invalid form';
      this.ngxService.stop();
      this.snackBarService.openSnackBar(this.responseMessage, 'error');
      return;
    }

    this.userService.updateUser(this.updateUserForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, '');
          this.ngxService.stop();
          this.refreshUser();
        },
        error: (error: any) => {
          this.ngxService.stop();
          this.responseMessage = error.error?.message || genericError;
          this.snackBarService.openSnackBar(this.responseMessage, 'error');
        }
      });
  }

  deactivateAccount() {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message:
          "deactivate your acount. You won't be able to login anymore." +
          'To activate your account back, contact berlizworld@gmail.com.',
        confirmation: true
      }
    });

    dialogRef.componentInstance.onEmitStatusChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.userService.deactivateAccount().subscribe({
          next: (response: any) => {
            localStorage.removeItem('token');
            this.snackbarService.openSnackBar(response, '');
            this.router.navigate(['/home']);
          },
          error: (error: any) => {
            this.responseMessage = error.error?.message || genericError;
            this.snackbarService.openSnackBar(this.responseMessage, 'error');
          }
        });
      });
  }

  openUpdateEmail() {
    const dialogRef = this.dialog.open(UpdateEmailModalComponent, {
      minWidth: '400px',
      disableClose: false,
      data: { userData: this.user }
    });

    dialogRef.componentInstance.onUpdateEMail
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refreshUser());
  }

}
