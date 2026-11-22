import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { FollowButtonComponent } from './follow-button.component';
import { AuthService } from 'src/app/services/auth.service';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { FollowService } from 'src/app/services/follow.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('FollowButtonComponent', () => {
  let component: FollowButtonComponent;
  let fixture: ComponentFixture<FollowButtonComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let authRedirect: jasmine.SpyObj<AuthRedirectService>;
  let followService: jasmine.SpyObj<FollowService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['hasSession', 'getCurrentUserId']);
    authRedirect = jasmine.createSpyObj('AuthRedirectService', ['goToLogin']);
    followService = jasmine.createSpyObj('FollowService', ['isFollowing', 'followUser', 'unfollowUser']);
    const snackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      imports: [FollowButtonComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: AuthRedirectService, useValue: authRedirect },
        { provide: FollowService, useValue: followService },
        { provide: SnackBarService, useValue: snackBarService },
      ],
    });

    fixture = TestBed.createComponent(FollowButtonComponent);
    component = fixture.componentInstance;
  });

  it('hides itself on a user\'s own profile', () => {
    authService.getCurrentUserId.and.returnValue(5);
    authService.hasSession.and.returnValue(true);
    component.userId = 5;

    fixture.detectChanges();

    expect(component.isSelf).toBeTrue();
    expect(followService.isFollowing).not.toHaveBeenCalled();
  });

  it('does not check follow status for a signed-out visitor', () => {
    authService.getCurrentUserId.and.returnValue(null);
    authService.hasSession.and.returnValue(false);
    component.userId = 7;

    fixture.detectChanges();

    expect(followService.isFollowing).not.toHaveBeenCalled();
    expect(component.following).toBeFalse();
  });

  it('sends a signed-out visitor to login instead of calling the API on toggle', () => {
    authService.getCurrentUserId.and.returnValue(null);
    authService.hasSession.and.returnValue(false);
    component.userId = 7;
    fixture.detectChanges();

    component.toggle();

    expect(authRedirect.goToLogin).toHaveBeenCalledWith('follow');
    expect(followService.followUser).not.toHaveBeenCalled();
  });

  it('loads the current follow status for a signed-in visitor', () => {
    authService.getCurrentUserId.and.returnValue(1);
    authService.hasSession.and.returnValue(true);
    followService.isFollowing.and.returnValue(of({ success: true, message: '', data: true, statusCode: 200 } as any));
    component.userId = 7;

    fixture.detectChanges();

    expect(followService.isFollowing).toHaveBeenCalledWith(7);
    expect(component.following).toBeTrue();
  });

  it('follows optimistically, then rolls back on failure', () => {
    authService.getCurrentUserId.and.returnValue(1);
    authService.hasSession.and.returnValue(true);
    followService.isFollowing.and.returnValue(of({ success: true, message: '', data: false, statusCode: 200 } as any));
    followService.followUser.and.returnValue(throwError(() => new Error('boom')));
    component.userId = 7;
    fixture.detectChanges();

    component.toggle();

    expect(component.following).toBeFalse();
  });

  it('unfollows when already following', () => {
    authService.getCurrentUserId.and.returnValue(1);
    authService.hasSession.and.returnValue(true);
    followService.isFollowing.and.returnValue(of({ success: true, message: '', data: true, statusCode: 200 } as any));
    followService.unfollowUser.and.returnValue(of({ success: true, message: '', data: undefined, statusCode: 200 } as any));
    component.userId = 7;
    fixture.detectChanges();

    component.toggle();

    expect(followService.unfollowUser).toHaveBeenCalledWith(7);
    expect(component.following).toBeFalse();
  });
});
