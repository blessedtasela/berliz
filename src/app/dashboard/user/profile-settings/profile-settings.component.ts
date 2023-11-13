import { Component, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CountryService } from 'src/app/services/country.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.css']
})
export class ProfileSettingsComponent {
  user!: Users;
  responseMessage: any;
  subscription = new Subscription;
  onUpdateUserEmit = new EventEmitter();
  updateUserForm!: FormGroup;
  invalidForm: boolean = false;
  countries: any[] = [];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private snackbarService: SnackBarService,
    private countryService: CountryService,
    private router: Router,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private formbuilder: FormBuilder,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.watchActivateAccount()
    this.watchDeactivateAccount()
    this.watchDeleteUser()
    this.watchUpdateProfilePhoto()
    this.watchUpdateUser()
    this.watchUpdateUserBio()
    this.watchUpdateUserRole()
    this.watchUpdateUserStatus()

    this.userStateService.userData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.user = cachedData;
      }
    });
    this.getCountriesData();
    this.initForm();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.subscription.add(
      this.userStateService.getUser().subscribe((user) => {
        this.user = user;
        this.userStateService.setUserSubject(user)
      }),
    );
    this.ngxService.stop()
  }

  initForm(): void {
    this.updateUserForm = this.formbuilder.group({
      'id': new FormControl(this.user?.id),
      'firstname': new FormControl(this.user?.firstname, [Validators.required, Validators.minLength(2)]),
      'lastname': new FormControl(this.user?.lastname, [Validators.required, Validators.minLength(2)]),
      'phone': new FormControl(this.user?.phone, Validators.compose([Validators.required, Validators.minLength(9)])),
      'postalCode': new FormControl(this.user?.postalCode, Validators.compose([Validators.required, Validators.minLength(5)])),
      'dob': new FormControl(this.user?.dob, Validators.required),
      'gender': new FormControl(this.user?.gender, Validators.required),
      'country': new FormControl(this.user?.country, Validators.required),
      'state': new FormControl(this.user?.state, [Validators.required, Validators.minLength(3)]),
      'city': new FormControl(this.user?.city, [Validators.required, Validators.minLength(3)]),
      'address': new FormControl(this.user?.address, [Validators.required, Validators.minLength(8)]),
      'bio': new FormControl(this.user?.bio, [Validators.required, Validators.minLength(8)]),
      'email': new FormControl(this.user?.email, Validators.compose([Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])])),
    })
  }

  updateGender(selectedGender: string) {
    this.user.gender = selectedGender;
    this.updateUserForm.get('gender')?.setValue(selectedGender); // Update the form control's value
  }

  deactivateAccount() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'deactivate your acount. You won\'t be able to login anymore.' +
        'To activate your account back, please contact berlizworld@gmail.com with your username and request.',
      confirmation: true
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.userService.deactivateAccount()
        .subscribe((response: any) => {
          localStorage.removeItem('token')
          this.ngxService.start()
          this.responseMessage = response;
          this.ngxService.stop();
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.router.navigate(['/home'])
        }, (error) => {
          this.ngxService.stop();
          console.log(error)
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  getCountriesData() {
    this.countryService.getCountriesData().subscribe((response: any) => {
      this.countries = response.map((country: any) => {
        return {
          name: country.name.common,
          states: country?.subdivisions ? Object.keys(country.subdivisions) : []
        };
      });
    });
  }

  submitForm(): void {
    this.ngxService.start();
    if (this.updateUserForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.userService.updateUser(this.updateUserForm.value)
        .subscribe((response: any) => {
          this.updateUserForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.handleEmitEvent()
          this.onUpdateUserEmit.emit();
        }
          , (error: any) => {
            this.ngxService.stop();
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

  watchActivateAccount() {
    this.rxStompService.watch('/topic/activateAccount').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.user.id === receivedUsers.id)
        this.user = receivedUsers
    });
  }

  watchDeactivateAccount() {
    this.rxStompService.watch('/topic/deactivateAccount').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.user.id === receivedUsers.id)
        this.user = receivedUsers
    });
  }

  watchUpdateUserStatus() {
    this.rxStompService.watch('/topic/updateUserStatus').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.user.id === receivedUsers.id)
        this.user = receivedUsers
    });
  }

  watchUpdateUserRole() {
    this.rxStompService.watch('/topic/updateUserRole').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.user.id === receivedUsers.id)
        this.user = receivedUsers
    });
  }

  watchDeleteUser() {
    this.rxStompService.watch('/topic/deleteUser').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.user.id === receivedUsers.id)
        this.user === null;
    });
  }

  watchUpdateUserBio() {
    this.rxStompService.watch('/topic/updateUserBio').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.user.id === receivedUsers.id)
        this.user = receivedUsers
    });
  }

  watchUpdateUser() {
    this.rxStompService.watch('/topic/updateUser').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.user.id === receivedUsers.id)
        this.user = receivedUsers
    });
  }

  watchUpdateProfilePhoto() {
    this.rxStompService.watch('/topic/updateProfilePhoto').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      if (this.user.id === receivedUsers.id)
        this.user = receivedUsers
    });
  }
}
