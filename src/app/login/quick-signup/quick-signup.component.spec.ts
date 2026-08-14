import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { QuickSignupComponent } from './quick-signup.component';
import { UserService } from 'src/app/services/user.service';
import { SocialAuthService } from 'src/app/services/social-auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MatDialog } from '@angular/material/dialog';

describe('QuickSignupComponent', () => {
  let component: QuickSignupComponent;
  let fixture: ComponentFixture<QuickSignupComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let socialAuthService: jasmine.SpyObj<SocialAuthService>;
  let snackBarService: jasmine.SpyObj<SnackBarService>;
  let router: Router;

  const successResponse = (accessToken = 'access-jwt', refreshToken = 'refresh-jwt') => ({
    message: 'Login successful',
    success: true,
    statusCode: 200,
    data: { accessToken, refreshToken, user: {} as any },
  }) as any;

  beforeEach(() => {
    userService = jasmine.createSpyObj('UserService', [
      'quickAdd', 'loginWithGoogle', 'loginWithFacebook', 'startRefreshTokenTimer',
    ]);

    socialAuthService = jasmine.createSpyObj('SocialAuthService', ['renderGoogleButton', 'loginWithFacebook']);
    socialAuthService.renderGoogleButton.and.returnValue(Promise.resolve());

    snackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);

    TestBed.configureTestingModule({
      declarations: [QuickSignupComponent],
      imports: [CommonModule, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: SocialAuthService, useValue: socialAuthService },
        { provide: SnackBarService, useValue: snackBarService },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(QuickSignupComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
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

  it('asks SocialAuthService to render the official Google button into #googleSignUpButton', () => {
    fixture.detectChanges();
    expect(socialAuthService.renderGoogleButton).toHaveBeenCalledWith('googleSignUpButton', jasmine.any(Function));
  });

  it('sets googleReady=true once the button actually renders', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.googleReady).toBeTrue();
  }));

  it('signs the user in when the GIS callback fires with an ID token', fakeAsync(() => {
    userService.loginWithGoogle.and.returnValue(of(successResponse()));
    fixture.detectChanges();
    tick();

    const onCredential = socialAuthService.renderGoogleButton.calls.mostRecent().args[1] as (t: string) => void;
    onCredential('the-google-id-token');

    expect(userService.loginWithGoogle).toHaveBeenCalledWith('the-google-id-token');
    expect(localStorage.getItem('token')).toBe('access-jwt');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  describe('loginWithFacebook', () => {
    it('signs the user up on a successful Facebook popup + backend verification', fakeAsync(() => {
      socialAuthService.loginWithFacebook.and.returnValue(Promise.resolve('fb-access-token'));
      userService.loginWithFacebook.and.returnValue(of(successResponse()));
      fixture.detectChanges();
      tick();

      component.loginWithFacebook();
      tick();

      expect(userService.loginWithFacebook).toHaveBeenCalledWith('fb-access-token');
      expect(localStorage.getItem('token')).toBe('access-jwt');
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('surfaces the backend error message when Facebook token verification fails', fakeAsync(() => {
      socialAuthService.loginWithFacebook.and.returnValue(Promise.resolve('fb-access-token'));
      userService.loginWithFacebook.and.returnValue(throwError(() => ({ error: { message: 'Invalid Facebook token' } })));
      fixture.detectChanges();
      tick();

      component.loginWithFacebook();
      tick();

      expect(router.navigate).not.toHaveBeenCalledWith(['/dashboard']);
      expect(snackBarService.openSnackBar).toHaveBeenCalledWith('Invalid Facebook token', 'error');
    }));
  });
});
