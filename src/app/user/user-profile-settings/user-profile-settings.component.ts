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
import { selectUser } from 'src/app/state/user/user.selector';
import { ProfileVisibility, SidebarDisplay } from 'src/app/models/users.interface';
import {
  updateProfileVisibility,
  updateProfileVisibilityFailure,
  updateProfileVisibilitySuccess,
  updateSidebarDisplayFailure,
  updateSidebarDisplaySuccess,
  updateMessagePopupEnabled,
  updateMessagePopupEnabledFailure,
  updateMessagePopupEnabledSuccess,
} from 'src/app/state/user-profile/user-profile.actions';
import { selectSavingVisibility, selectSavingSidebarDisplay, selectSavingMessagePopupEnabled } from 'src/app/state/user-profile/user-profile.selector';
import { SidebarStateService } from 'src/app/services/sidebar-state.service';
import { BrowserNotificationService, NotificationCategory } from 'src/app/services/browser-notification.service';
import { BlockService } from 'src/app/services/block.service';
import { BlockedUser } from 'src/app/models/block.model';

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
  savingSidebarDisplay = false;

  // ── Message popup preference ────────────────────────────────────────────
  /** Value on the user record from /user/getUser. On until proven otherwise. */
  private serverMessagePopupEnabled = true;
  /** Set once the user flips the toggle in this session; takes precedence. */
  private localMessagePopupEnabled: boolean | null = null;
  savingMessagePopupEnabled = false;

  // ── Username ─────────────────────────────────────────────────────────────
  usernameDraft = '';
  savingUsername = false;
  usernameError: string | null = null;
  private readonly USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

  // ── Blocked users ────────────────────────────────────────────────────────
  blockedUsers: BlockedUser[] = [];
  loadingBlockedUsers = false;

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
    public sidebarState: SidebarStateService,
    private browserNotifications: BrowserNotificationService,
    private blockService: BlockService,
  ) { }

  ngOnInit(): void {
    // Load user initially
    this.store.dispatch(loadUser());
    this.loadBlockedUsers();

    // Subscribe to user state
    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.user = user;
          this.serverVisibility = user.profileVisibility === 'public' ? 'public' : 'private';
          this.serverMessagePopupEnabled = user.messagePopupEnabled !== false;
          // Only seed the draft the first time (or if the field was empty) --
          // don't clobber whatever the user is mid-typing on a later refreshUser().
          if (!this.usernameDraft) this.usernameDraft = user.username ?? '';
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

    // Message popup — in-flight flag plus success/failure feedback.
    this.store.select(selectSavingMessagePopupEnabled)
      .pipe(takeUntil(this.destroy$))
      .subscribe(saving => this.savingMessagePopupEnabled = saving);

    this.actions$
      .pipe(ofType(updateMessagePopupEnabledSuccess), takeUntil(this.destroy$))
      .subscribe(({ response, messagePopupEnabled }) => {
        this.localMessagePopupEnabled = messagePopupEnabled;
        this.snackBarService.openSnackBar(
          response?.message || (messagePopupEnabled
            ? 'Message popup turned on'
            : 'Message popup turned off'),
          ''
        );
        // Keep /user/getUser in sync so a reload doesn't show the old value.
        this.store.dispatch(refreshUser());
      });

    this.actions$
      .pipe(ofType(updateMessagePopupEnabledFailure), takeUntil(this.destroy$))
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
    if (this.user?.username) return `/user/${this.user.username}`;
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

  /** Always the live, authoritative mode — same value the sidebar itself is showing right now. */
  get sidebarDisplay(): SidebarDisplay {
    return this.sidebarState.currentMode;
  }

  setSidebarDisplay(display: SidebarDisplay): void {
    if (this.savingSidebarDisplay || display === this.sidebarDisplay) return;

    // SidebarStateService.setMode() now both applies it live AND persists it as
    // the new preference (any manual toggle does) — no separate dispatch needed
    // here, it would just be a duplicate save.
    this.sidebarState.setMode(display);
  }

  // -------------------------
  // MESSAGE POPUP
  // -------------------------

  /** Locally-chosen value wins over whatever the last /user/getUser returned. */
  get messagePopupEnabled(): boolean {
    return this.localMessagePopupEnabled ?? this.serverMessagePopupEnabled;
  }

  toggleMessagePopupEnabled(): void {
    if (this.savingMessagePopupEnabled) return;

    this.store.dispatch(updateMessagePopupEnabled({ messagePopupEnabled: !this.messagePopupEnabled }));
  }

  // -------------------------
  // USERNAME
  // -------------------------

  get usernameChanged(): boolean {
    return this.usernameDraft.trim().toLowerCase() !== (this.user?.username ?? '');
  }

  /** Same shape the backend enforces (UserServiceImplement.USERNAME_PATTERN) -- checked client-side just to fail fast, the server is still the real authority. */
  get usernameFormatValid(): boolean {
    return this.USERNAME_PATTERN.test(this.usernameDraft.trim().toLowerCase());
  }

  saveUsername(): void {
    if (this.savingUsername || !this.usernameChanged) return;

    const candidate = this.usernameDraft.trim().toLowerCase();
    this.usernameDraft = candidate;
    if (!this.usernameFormatValid) {
      this.usernameError = 'Username must be 3-30 characters: lowercase letters, numbers, and underscores only';
      return;
    }

    this.usernameError = null;
    this.savingUsername = true;
    this.userService.updateUsername(candidate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.savingUsername = false;
          this.user = { ...this.user, username: candidate };
          this.snackBarService.openSnackBar(res.data || 'Username updated', '');
          this.store.dispatch(refreshUser());
        },
        error: err => {
          this.savingUsername = false;
          // Taken / disallowed-word / bad-format rejections all come back as a
          // real 400 with the message in the body (GlobalExceptionHandler).
          this.usernameError = err.error?.message || genericError;
        },
      });
  }

  // -------------------------
  // BLOCKED USERS
  // -------------------------

  loadBlockedUsers(): void {
    this.loadingBlockedUsers = true;
    this.blockService.getBlockedUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.loadingBlockedUsers = false;
          this.blockedUsers = res.data ?? [];
        },
        error: () => this.loadingBlockedUsers = false,
      });
  }

  unblock(user: BlockedUser): void {
    this.blockService.unblockUser(user.blockedUserId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.blockedUsers = this.blockedUsers.filter(b => b.blockedUserId !== user.blockedUserId);
          this.snackBarService.openSnackBar(`Unblocked ${user.blockedUserName}`, '');
        },
        error: () => this.snackBarService.openSnackBar('Could not unblock', 'error'),
      });
  }

  // ═══════════ BROWSER NOTIFICATIONS ═══════════
  // Per-device (localStorage), not synced across devices — see
  // BrowserNotificationService for why, and which categories actually have
  // a live event to fire on today.

  get browserNotificationsSupported(): boolean {
    return this.browserNotifications.supported;
  }

  get browserNotificationPermission(): NotificationPermission | 'unsupported' {
    return this.browserNotifications.permission;
  }

  get browserNotificationsEnabled(): boolean {
    return this.browserNotifications.masterEnabled;
  }

  isNotificationCategoryEnabled(category: NotificationCategory): boolean {
    return this.browserNotifications.isCategoryEnabled(category);
  }

  async toggleBrowserNotifications(): Promise<void> {
    if (!this.browserNotificationsEnabled) {
      const permission = await this.browserNotifications.requestPermission();
      if (permission !== 'granted') {
        if (permission === 'denied') {
          this.snackBarService.openSnackBar(
            'Notifications are blocked for this site in your browser settings — enable them there first.', 'error'
          );
        }
        return;
      }
    }
    this.browserNotifications.setMasterEnabled(!this.browserNotificationsEnabled);
  }

  toggleNotificationCategory(category: NotificationCategory): void {
    this.browserNotifications.setCategoryEnabled(category, !this.isNotificationCategoryEnabled(category));
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
