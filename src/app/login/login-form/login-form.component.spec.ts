import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginFormComponent } from './login-form.component';
import { UserService } from 'src/app/services/user.service';
import { SocialAuthService } from 'src/app/services/social-auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatDialog } from '@angular/material/dialog';
import { WebAuthnService } from 'src/app/services/webauthn.service';

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let socialAuthService: jasmine.SpyObj<SocialAuthService>;
  let snackBarService: jasmine.SpyObj<SnackBarService>;
  let ngxService: jasmine.SpyObj<NgxUiLoaderService>;
  let router: Router;
  let returnUrl: string | null;
  let mobileRedirect: string | null;
  let googleAuthComplete: string | null;
  let googleAuthAccessToken: string | null;
  let googleAuthRefreshToken: string | null;
  let googleAuthError: string | null;

  const successResponse = (accessToken = 'access-jwt', refreshToken = 'refresh-jwt') => ({
    message: 'Login successful',
    success: true,
    statusCode: 200,
    data: { accessToken, refreshToken, user: {} as any },
  }) as any;

  const failureResponse = (message = 'Invalid or expired Google token') => ({
    message,
    success: false,
    statusCode: 200,
    data: null,
  }) as any;

  beforeEach(() => {
    userService = jasmine.createSpyObj('UserService', [
      'checkToken', 'loginWithGoogle', 'loginWithFacebook', 'startRefreshTokenTimer', 'login', 'sendActivationToken',
    ]);
    userService.checkToken.and.returnValue(of({ message: '', success: true, statusCode: 200, data: 'true' }));
    userService.sendActivationToken.and.returnValue(of({ message: 'Check your email.', success: true, statusCode: 200, data: '' }));

    socialAuthService = jasmine.createSpyObj('SocialAuthService', ['renderGoogleButton', 'loginWithFacebook', 'preloadFacebookSdk']);
    socialAuthService.renderGoogleButton.and.returnValue(Promise.resolve());

    snackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    ngxService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const webAuthnServiceSpy = jasmine.createSpyObj('WebAuthnService', ['isPlatformAuthenticatorAvailable', 'loginWithPasskey']);
    webAuthnServiceSpy.isPlatformAuthenticatorAvailable.and.returnValue(Promise.resolve(false));
    returnUrl = null;
    mobileRedirect = null;
    googleAuthComplete = null;
    googleAuthAccessToken = null;
    googleAuthRefreshToken = null;
    googleAuthError = null;

    TestBed.configureTestingModule({
      declarations: [LoginFormComponent],
      imports: [CommonModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: SocialAuthService, useValue: socialAuthService },
        { provide: SnackBarService, useValue: snackBarService },
        { provide: NgxUiLoaderService, useValue: ngxService },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: WebAuthnService, useValue: webAuthnServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get queryParamMap() {
                return convertToParamMap({
                  ...(returnUrl ? { returnUrl } : {}),
                  ...(mobileRedirect ? { mobileRedirect } : {}),
                  ...(googleAuthComplete ? { googleAuthComplete } : {}),
                  ...(googleAuthAccessToken ? { accessToken: googleAuthAccessToken } : {}),
                  ...(googleAuthRefreshToken ? { refreshToken: googleAuthRefreshToken } : {}),
                  ...(googleAuthError ? { googleAuthError } : {}),
                });
              }
            }
          }
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    // The returnUrl fallback reads this real sessionStorage key (see guest-booking-draft.ts) --
    // clear it so a leftover draft from another spec file can never change where these tests expect to land.
    sessionStorage.removeItem('berliz.guestBooking.v1');
  });

  afterEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('berliz.guestBooking.v1');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Google Sign-In button rendering', () => {
    it('asks SocialAuthService to render the official button into #googleSignInButton', () => {
      fixture.detectChanges();
      expect(socialAuthService.renderGoogleButton).toHaveBeenCalledWith('googleSignInButton', jasmine.any(Function), null);
    });

    it('passes the validated mobileRedirect through so the backend callback can hand tokens straight to the app', () => {
      mobileRedirect = 'berliz://auth-callback';
      fixture.detectChanges();
      expect(socialAuthService.renderGoogleButton).toHaveBeenCalledWith('googleSignInButton', jasmine.any(Function), 'berliz://auth-callback');
    });

    it('sets googleReady=true once the button actually renders', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      expect(component.googleReady).toBeTrue();
    }));

    it('leaves googleReady=false when Google Sign-In is not configured yet', fakeAsync(() => {
      socialAuthService.renderGoogleButton.and.returnValue(Promise.reject(new Error('not configured')));
      fixture.detectChanges();
      tick();
      expect(component.googleReady).toBeFalse();
    }));

    it('loginWithGoogleFallback shows a "not configured" message', () => {
      fixture.detectChanges();
      component.loginWithGoogleFallback();
      expect(component.submitError).toMatch(/not configured/i);
    });

    it('logs the user in when the GIS callback fires with an ID token', fakeAsync(() => {
      userService.loginWithGoogle.and.returnValue(of(successResponse()));
      fixture.detectChanges();
      tick();

      // Capture the callback SocialAuthService.renderGoogleButton was given and invoke it,
      // simulating Google Identity Services completing the sign-in flow.
      const onCredential = socialAuthService.renderGoogleButton.calls.mostRecent().args[1] as (t: string) => void;
      onCredential('the-google-id-token');

      expect(userService.loginWithGoogle).toHaveBeenCalledWith('the-google-id-token', null);
      expect(localStorage.getItem('token')).toBe('access-jwt');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-jwt');
      expect(userService.startRefreshTokenTimer).toHaveBeenCalled();
      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    }));

    it('shows an error and does not navigate when the backend rejects the Google token', fakeAsync(() => {
      userService.loginWithGoogle.and.returnValue(of(failureResponse('Invalid or expired Google token')));
      fixture.detectChanges();
      tick();

      const onCredential = socialAuthService.renderGoogleButton.calls.mostRecent().args[1] as (t: string) => void;
      onCredential('bad-token');

      expect(localStorage.getItem('token')).toBeNull();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(component.submitError).toBe('Invalid or expired Google token');
    }));
  });

  describe('loginWithFacebook', () => {
    it('logs the user in on a successful Facebook popup + backend verification', fakeAsync(() => {
      socialAuthService.loginWithFacebook.and.returnValue(Promise.resolve('fb-access-token'));
      userService.loginWithFacebook.and.returnValue(of(successResponse()));
      fixture.detectChanges();
      tick();

      component.loginWithFacebook();
      tick();

      expect(userService.loginWithFacebook).toHaveBeenCalledWith('fb-access-token', null);
      expect(localStorage.getItem('token')).toBe('access-jwt');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    }));

    it('shows a "not configured" message and never calls the backend when Facebook Login is unavailable', fakeAsync(() => {
      // callFake (not returnValue) so the rejected promise is created fresh at call time —
      // component.loginWithFacebook() attaches its .catch() synchronously right after, so
      // there's no tick() in between where zone.js would see it as unhandled.
      socialAuthService.loginWithFacebook.and.callFake(
        () => Promise.reject(new Error('Facebook Login is not configured yet.'))
      );
      fixture.detectChanges();
      tick();

      component.loginWithFacebook();
      tick();

      expect(userService.loginWithFacebook).not.toHaveBeenCalled();
      expect(component.submitError).toBe('Facebook Login is not configured yet.');
    }));

    it('surfaces the backend error message when Facebook token verification fails', fakeAsync(() => {
      socialAuthService.loginWithFacebook.and.returnValue(Promise.resolve('fb-access-token'));
      userService.loginWithFacebook.and.returnValue(throwError(() => ({ error: { message: 'Invalid Facebook token' } })));
      fixture.detectChanges();
      tick();

      component.loginWithFacebook();
      tick();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(component.submitError).toBe('Invalid Facebook token');
    }));
  });

  describe('login() -- returning to where the user was, not always /dashboard', () => {

    function fillAndSubmit() {
      fixture.detectChanges();
      component.loginForm.setValue({ email: 'jane@example.com', password: 'password123' });
      component.login();
    }

    it('says why the visitor is here when a protected page sent them', () => {
      returnUrl = '/dashboard';
      expect(component.gateMessage).toBe('Log in to view your dashboard.');
      returnUrl = '/trainers/some-trainer/level-up';
      expect(component.gateMessage).toBe('Log in to continue.');
      returnUrl = null;
      expect(component.gateMessage).toBeNull();
      returnUrl = '//evil.example.com';
      expect(component.gateMessage).toBeNull();
    });

    it('goes to /dashboard when there is no returnUrl (a plain, unprompted visit to /login)', () => {
      userService.login.and.returnValue(of(successResponse()));

      fillAndSubmit();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('returns to the returnUrl a login gate (AuthGuard, AuthRedirectService) attached', () => {
      returnUrl = '/dashboard/messages';
      userService.login.and.returnValue(of(successResponse()));

      fillAndSubmit();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard/messages');
    });

    it('falls back to /dashboard rather than following a protocol-relative returnUrl (open-redirect guard)', () => {
      returnUrl = '//evil.example.com';
      userService.login.and.returnValue(of(successResponse()));

      fillAndSubmit();

      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('does not navigate when the backend responds without an access token', () => {
      userService.login.and.returnValue(of(failureResponse('Incorrect email or password')));

      fillAndSubmit();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(component.submitError).toBe('Incorrect email or password');
    });
  });

  // SG-08: completeAuth() puts a fresh access+refresh token pair straight onto
  // `mobileRedirect` and navigates there -- an unvalidated value is a token-exfiltration
  // open redirect (`?mobileRedirect=https://attacker.example` hands the victim's session
  // to the attacker the moment they log in). Only the app's own callback scheme
  // (`berliz://…` in production, `exp://…`/`exp+berliz://…` under Expo Go) is legitimate;
  // AuthContext.tsx's loginWithWeb() (mobile repo) never sends anything else.
  describe('mobileRedirect validation (open-redirect / token-exfiltration guard)', () => {
    const isAllowed = (value: string) => (component as any).isAllowedMobileRedirect(value);

    it('accepts the app\'s real callback schemes', () => {
      expect(isAllowed('berliz://auth-callback')).toBeTrue();
      expect(isAllowed('exp://192.168.1.5:8081/--/auth-callback')).toBeTrue();
      expect(isAllowed('exp+berliz://expo-development-client/--/auth-callback')).toBeTrue();
    });

    it('rejects an attacker-supplied http(s)/protocol-relative/unparseable value', () => {
      expect(isAllowed('https://attacker.example/collect')).toBeFalse();
      expect(isAllowed('http://attacker.example/collect')).toBeFalse();
      expect(isAllowed('//attacker.example/collect')).toBeFalse();
      expect(isAllowed('javascript:alert(1)')).toBeFalse();
      expect(isAllowed('not-a-url')).toBeFalse();
    });

    it('a malicious mobileRedirect is discarded, not acted on -- the ordinary web session path still runs', () => {
      mobileRedirect = 'https://attacker.example/collect';
      localStorage.setItem('token', 'existing-jwt');
      userService.checkToken.and.returnValue(of({ message: '', success: true, statusCode: 200, data: 'true' }));

      fixture.detectChanges(); // ngOnInit

      // If the malicious value had been accepted, ngOnInit would have returned early
      // (the "skip the already-logged-in shortcut" branch) and never reached this call.
      expect(userService.checkToken).toHaveBeenCalled();
    });

    it('a real app callback URL is honored -- the web auto-redirect shortcut is correctly skipped for it', () => {
      mobileRedirect = 'berliz://auth-callback';
      localStorage.setItem('token', 'existing-jwt');
      userService.checkToken.and.returnValue(of({ message: '', success: true, statusCode: 200, data: 'true' }));

      fixture.detectChanges(); // ngOnInit

      expect(userService.checkToken).not.toHaveBeenCalled();
    });
  });

  // Landing back here from Google's redirect-mode callback (SocialAuthRest#
  // googleRedirectCallback) -- the popup-based fallback silently fails under Safari's ITP and
  // in-app WebViews, so that endpoint redirects here with the resulting tokens in the query
  // string instead. Reaching this page with these params always means an ordinary web session
  // (a valid mobileRedirect makes the backend redirect straight to the app instead).
  describe('Google redirect-mode callback landing (googleAuthComplete / googleAuthError)', () => {
    it('stores the tokens and navigates, same as any other successful login', () => {
      googleAuthComplete = '1';
      googleAuthAccessToken = 'access-from-google-redirect';
      googleAuthRefreshToken = 'refresh-from-google-redirect';

      fixture.detectChanges(); // ngOnInit

      expect(localStorage.getItem('token')).toBe('access-from-google-redirect');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-from-google-redirect');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('does not treat googleAuthComplete as a login if the tokens are somehow missing', () => {
      googleAuthComplete = '1';

      fixture.detectChanges();

      expect(localStorage.getItem('token')).toBeNull();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('shows the backend-provided message and does not log in on a failed Google sign-in', () => {
      googleAuthError = 'Invalid or expired Google token';

      fixture.detectChanges();

      expect(component.submitError).toBe('Invalid or expired Google token');
      expect(localStorage.getItem('token')).toBeNull();
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('skips the ordinary already-logged-in shortcut while handling the callback', () => {
      googleAuthComplete = '1';
      googleAuthAccessToken = 'access-from-google-redirect';
      googleAuthRefreshToken = 'refresh-from-google-redirect';
      localStorage.setItem('token', 'some-stale-token');

      fixture.detectChanges();

      // checkToken() is the "already logged in" shortcut -- it must not run here, the fresh
      // tokens from the callback are what should end up stored, not whatever was stale before.
      expect(userService.checkToken).not.toHaveBeenCalled();
      expect(localStorage.getItem('token')).toBe('access-from-google-redirect');
    });
  });

  describe("an account that is not activated yet", () => {
    it("offers the activation page instead of a dead end", () => {
      component.submitError = "Your account is not yet activated. Please check your email.";
      fixture.detectChanges();
      expect(component.needsActivation).toBeTrue();
      expect(fixture.nativeElement.querySelector("[data-testid=enter-activation-code]")).not.toBeNull();
    });

    it("says nothing extra for an ordinary wrong password", () => {
      component.submitError = "Incorrect email or password";
      fixture.detectChanges();
      expect(component.needsActivation).toBeFalse();
      expect(fixture.nativeElement.querySelector("[data-testid=enter-activation-code]")).toBeNull();
    });
  });

  // SG-11: the "Didn't receive your activation email?" form's ngSubmit passes the ngModel ref's
  // OWN `.value` (already a plain string) -- sendActivationMail used to unwrap it a second time as
  // if it were an HTMLInputElement, always landing on `undefined` and sending the resend request
  // with no email, which 404s (the route needs an email path segment).
  describe('sendActivationMail (resend activation email)', () => {
    it('sends the real email string straight through to the backend', () => {
      // The ViewChild it resets on success only exists after a change-detection pass.
      fixture.detectChanges();
      component.sendActivationMail('taselablessed+12@gmail.com');
      expect(userService.sendActivationToken).toHaveBeenCalledWith('taselablessed+12@gmail.com');
      expect(component.activationError).toBeNull();
    });

    it('rejects a blank email locally instead of sending a request with none', () => {
      component.sendActivationMail('');
      expect(userService.sendActivationToken).not.toHaveBeenCalled();
      expect(component.activationError).toContain('Enter the email address');
    });
  });
});
