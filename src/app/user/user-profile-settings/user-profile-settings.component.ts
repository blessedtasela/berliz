import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject, merge, takeUntil } from 'rxjs';
import { City, Country, State } from 'src/app/models/Location.interface';
import { Users } from 'src/app/models/users.interface';
import { CountryService } from 'src/app/services/country.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { UpdateEmailModalComponent } from 'src/app/shared/update-email-modal/update-email-modal.component';
import { emailExtensionValidator, genericError } from 'src/validators/form-validators.module';

import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { loadUser, refreshUser } from 'src/app/state/user/user.actions';
import { ApiResponse } from 'src/app/models/Api.interface';
import { User } from 'firebase/auth';
import { selectUser } from 'src/app/state/user/user.selector';
import { ProfileVisibility, SidebarDisplay } from 'src/app/models/users.interface';
import {
  updateProfileVisibility,
  updateProfileVisibilityFailure,
  updateProfileVisibilitySuccess,
  updateSidebarDisplay,
  updateSidebarDisplayFailure,
  updateSidebarDisplaySuccess,
} from 'src/app/state/user-profile/user-profile.actions';
import { selectSavingVisibility, selectSavingSidebarDisplay } from 'src/app/state/user-profile/user-profile.selector';
import { SidebarStateService } from 'src/app/services/sidebar-state.service';

const KNOWN_SIDEBAR_MODES: SidebarDisplay[] = ['expanded', 'collapsed', 'hidden'];

@Component({
  selector: 'app-user-profile-settings',
  templateUrl: './user-profile-settings.component.html',
  styleUrls: ['./user-profile-settings.component.css']
})
export class UserProfileSettingsComponent implements OnInit, OnDestroy {

  user!: Users;
  updateUserForm!: FormGroup;
  responseMessage: any;
  invalidForm = false;
  originalValue: any;

  countries: Country[] = [];
  states: State[] = [];
  cities: City[] = [];

  selectedCountryIso2 = '';
  selectedStateIso2 = '';

  // ── Public profile visibility ───────────────────────────────────────────
  /** Value on the user record from /user/getUser. Private until proven otherwise. */
  private serverVisibility: ProfileVisibility = 'private';
  /** Set once the user flips the toggle in this session; takes precedence. */
  private localVisibility: ProfileVisibility | null = null;
  savingVisibility = false;

  // ── Sidebar display preference ──────────────────────────────────────────
  /** Value on the user record from /user/getUser. Defaults to 'expanded'. */
  private serverSidebarDisplay: SidebarDisplay = 'expanded';
  /** Set once the user picks an option in this session; takes precedence. */
  private localSidebarDisplay: SidebarDisplay | null = null;
  savingSidebarDisplay = false;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private userService: UserService,
    private countryService: CountryService,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private sidebarState: SidebarStateService
  ) { }

  ngOnInit(): void {
    // Load user initially
    this.store.dispatch(loadUser());

    // Subscribe to user state
    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.user = user;
          this.serverVisibility = user.profileVisibility === 'public' ? 'public' : 'private';
          this.serverSidebarDisplay = KNOWN_SIDEBAR_MODES.includes(user.sidebarDisplay as SidebarDisplay)
            ? (user.sidebarDisplay as SidebarDisplay)
            : 'expanded';
          this.initOrPatchForm();
          this.originalValue = structuredClone(user);
          this.updateUserForm.patchValue(user);
        }
      });

    // Load countries
    this.getCountriesData();

    // Profile visibility — in-flight flag plus success/failure feedback.
    this.store.select(selectSavingVisibility)
      .pipe(takeUntil(this.destroy$))
      .subscribe(saving => this.savingVisibility = saving);

    this.actions$
      .pipe(ofType(updateProfileVisibilitySuccess), takeUntil(this.destroy$))
      .subscribe(({ response, profileVisibility }) => {
        this.localVisibility = profileVisibility;
        this.snackBarService.openSnackBar(
          response?.message || (profileVisibility === 'public'
            ? 'Your profile is now public'
            : 'Your profile is now private'),
          ''
        );
        // Keep /user/getUser in sync so a reload doesn't show the old value.
        this.store.dispatch(refreshUser());
      });

    this.actions$
      .pipe(ofType(updateProfileVisibilityFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => this.snackBarService.openSnackBar(error, 'error'));

    // Sidebar display — in-flight flag plus success/failure feedback.
    this.store.select(selectSavingSidebarDisplay)
      .pipe(takeUntil(this.destroy$))
      .subscribe(saving => this.savingSidebarDisplay = saving);

    this.actions$
      .pipe(ofType(updateSidebarDisplaySuccess), takeUntil(this.destroy$))
      .subscribe(({ response, sidebarDisplay }) => {
        this.localSidebarDisplay = sidebarDisplay;
        this.snackBarService.openSnackBar(
          response?.message || `Sidebar display set to ${sidebarDisplay}`,
          ''
        );
        // Keep /user/getUser in sync so a reload doesn't show the old value.
        this.store.dispatch(refreshUser());
      });

    this.actions$
      .pipe(ofType(updateSidebarDisplayFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => this.snackBarService.openSnackBar(error, 'error'));
  }

  // -------------------------
  // PROFILE VISIBILITY
  // -------------------------

  /** Locally-chosen value wins over whatever the last /user/getUser returned. */
  get profileVisibility(): ProfileVisibility {
    return this.localVisibility ?? this.serverVisibility;
  }

  get isProfilePublic(): boolean {
    return this.profileVisibility === 'public';
  }

  /** Link to the page other people would see. */
  get publicProfileLink(): string | null {
    return this.user?.id ? `/user/${this.user.id}` : null;
  }

  toggleProfileVisibility(): void {
    if (this.savingVisibility) return;

    const next: ProfileVisibility = this.isProfilePublic ? 'private' : 'public';
    this.store.dispatch(updateProfileVisibility({ profileVisibility: next }));
  }

  // -------------------------
  // SIDEBAR DISPLAY
  // -------------------------

  /** Locally-chosen value wins over whatever the last /user/getUser returned. */
  get sidebarDisplay(): SidebarDisplay {
    return this.localSidebarDisplay ?? this.serverSidebarDisplay;
  }

  setSidebarDisplay(display: SidebarDisplay): void {
    if (this.savingSidebarDisplay || display === this.sidebarDisplay) return;

    this.store.dispatch(updateSidebarDisplay({ sidebarDisplay: display }));
    // Apply it to the live sidebar for this session immediately — the setting is
    // meant to be felt right away, not just after a reload. Manual toggles via
    // the sidebar's own controls (expand/collapse, the floating reopen button)
    // still override this afterwards, same as any other manual toggle.
    this.sidebarState.setMode(display);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // -------------------------
  // FORM INIT / PATCH
  // -------------------------
  private initOrPatchForm() {
    if (!this.updateUserForm) {
      this.updateUserForm = this.formBuilder.group({
        id: [this.user.id],
        firstname: [this.user.firstname, [Validators.required, Validators.minLength(2)]],
        lastname: [this.user.lastname, [Validators.required, Validators.minLength(2)]],
        phone: [this.user.phone, [Validators.required, Validators.minLength(9)]],
        postalCode: [this.user.postalCode, [Validators.required, Validators.minLength(5)]],
        dob: [this.user.dob, Validators.required],
        gender: [this.user.gender, Validators.required],
        country: [this.user.country, Validators.required],
        state: [this.user.state, Validators.required],
        city: [this.user.city, Validators.required],
        address: [this.user.address, [Validators.required, Validators.minLength(8)]],
        bio: [this.user.bio, [Validators.required, Validators.minLength(8)]],
        email: [
          this.user.email,
          [Validators.required, Validators.email, emailExtensionValidator(['com', 'org'])]
        ]
      });
    } else {
      this.updateUserForm.patchValue(this.user);
    }
  }

  // -------------------------
  // COUNTRY / STATE / CITY
  // -------------------------
  getCountriesData() {
    this.countryService.getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => this.countries = res);
  }

  onCountryChange(country: any) {
    if (!country?.id) return;

    this.selectedCountryIso2 = country.iso2;
    this.updateUserForm.patchValue({ state: '', city: '' });
    this.states = [];
    this.cities = [];

    this.countryService.getStates(country.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => this.states = res);
  }

  onStateChange(state: any) {
    if (!state?.id) return;

    this.updateUserForm.patchValue({ city: '' });
    this.cities = [];

    this.countryService.getCities(state.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => this.cities = res);
  }

  onGenderChange(gender: string) {
    if (!gender) return;

    this.updateUserForm.patchValue({ gender });
    this.updateUserForm.get('gender')?.markAsDirty();
    this.updateUserForm.get('gender')?.markAsTouched();
  }

  // -------------------------
  // UPDATE USER
  // -------------------------
  onSubmitForm() {
    this.ngxService.start();

    if (this.updateUserForm.invalid) {
      this.invalidForm = true;
      this.snackBarService.openSnackBar('Invalid form', 'error');
      this.ngxService.stop();
      return;
    }

    this.userService.updateUser(this.updateUserForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBarService.openSnackBar(response.message, '');
          this.store.dispatch(refreshUser());
          this.updateUserForm.markAsPristine();
          this.updateUserForm.markAsUntouched();
          this.invalidForm = false;
          this.ngxService.stop();
        },
        error: (error) => {
          this.snackBarService.openSnackBar(error.error?.message || genericError, 'error');
          this.ngxService.stop();
        }
      });
  }

  // -------------------------
  // DEACTIVATE ACCOUNT
  // -------------------------
  deactivateAccount() {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: "Deactivate your account. You won't be able to login anymore.",
        confirmation: true
      }
    });

    dialogRef.componentInstance.onEmitStatusChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.userService.deactivateAccount().subscribe({
          next: (response: any) => {
            localStorage.removeItem('token');
            this.snackBarService.openSnackBar(response, '');
            this.router.navigate(['/home']);
          },
          error: (error) => {
            this.snackBarService.openSnackBar(error.error?.message || genericError, 'error');
          }
        });
      });
  }

  // -------------------------
  // UPDATE EMAIL MODAL
  // -------------------------
  openUpdateEmail() {
    const dialogRef = this.dialog.open(UpdateEmailModalComponent, {
      minWidth: '400px',
      disableClose: true,
      data: { userData: this.user },
    });

    dialogRef.componentInstance.onUpdateEMail
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.store.dispatch(refreshUser()));
  }
}
