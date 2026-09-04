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

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let socialAuthService: jasmine.SpyObj<SocialAuthService>;
  let snackBarService: jasmine.SpyObj<SnackBarService>;
  let ngxService: jasmine.SpyObj<NgxUiLoaderService>;
  let router: Router;
  let returnUrl: string | null;

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
      'checkToken', 'loginWithGoogle', 'loginWithFacebook', 'startRefreshTokenTimer', 'login',
    ]);
    userService.checkToken.and.returnValue(of({ message: '', success: true, statusCode: 200, data: 'true' }));

    socialAuthService = jasmine.createSpyObj('SocialAuthService', ['renderGoogleButton', 'loginWithFacebook', 'preloadFacebookSdk']);
    socialAuthService.renderGoogleButton.and.returnValue(Promise.resolve());

    snackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    ngxService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    returnUrl = null;

    TestBed.configureTestingModule({
      declarations: [LoginFormComponent],
      imports: [CommonModule, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: SocialAuthService, useValue: socialAuthService },
        { provide: SnackBarService, useValue: snackBarService },
        { provide: NgxUiLoaderService, useValue: ngxService },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { get queryParamMap() { return convertToParamMap(returnUrl ? { returnUrl } : {}); } } }
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
  });

  afterEach(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Google Sign-In button rendering', () => {
    it('asks SocialAuthService to render the official button into #googleSignInButton', () => {
      fixture.detectChanges();
      expect(socialAuthService.renderGoogleButton).toHaveBeenCalledWith('googleSignInButton', jasmine.any(Function));
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
      expect(snackBarService.openSnackBar).toHaveBeenCalledWith(jasmine.stringMatching(/not configured/i), 'error');
    });

    it('logs the user in when the GIS callback fires with an ID token', fakeAsync(() => {
      userService.loginWithGoogle.and.returnValue(of(successResponse()));
      fixture.detectChanges();
      tick();

      // Capture the callback SocialAuthService.renderGoogleButton was given and invoke it,
      // simulating Google Identity Services completing the sign-in flow.
      const onCredential = socialAuthService.renderGoogleButton.calls.mostRecent().args[1] as (t: string) => void;
      onCredential('the-google-id-token');

      expect(userService.loginWithGoogle).toHaveBeenCalledWith('the-google-id-token');
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
      expect(snackBarService.openSnackBar).toHaveBeenCalledWith('Invalid or expired Google token', 'error');
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

      expect(userService.loginWithFacebook).toHaveBeenCalledWith('fb-access-token');
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
      expect(snackBarService.openSnackBar).toHaveBeenCalledWith('Facebook Login is not configured yet.', 'error');
    }));

    it('surfaces the backend error message when Facebook token verification fails', fakeAsync(() => {
      socialAuthService.loginWithFacebook.and.returnValue(Promise.resolve('fb-access-token'));
      userService.loginWithFacebook.and.returnValue(throwError(() => ({ error: { message: 'Invalid Facebook token' } })));
      fixture.detectChanges();
      tick();

      component.loginWithFacebook();
      tick();

      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(snackBarService.openSnackBar).toHaveBeenCalledWith('Invalid Facebook token', 'error');
    }));
  });

  describe('login() -- returning to where the user was, not always /dashboard', () => {

    function fillAndSubmit() {
      fixture.detectChanges();
      component.loginForm.setValue({ email: 'jane@example.com', password: 'password123' });
      component.login();
    }

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
      expect(snackBarService.openSnackBar).toHaveBeenCalledWith('Incorrect email or password', 'error');
    });
  });
});
