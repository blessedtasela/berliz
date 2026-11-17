import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { PublicProfileComponent } from './public-profile.component';
import { AuthService } from 'src/app/services/auth.service';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadPublicProfile, loadPublicProfileByUsername } from 'src/app/state/user-profile/user-profile.actions';
import { cloneWorkoutTemplate } from 'src/app/state/workout/workout.actions';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('PublicProfileComponent', () => {
  let component: PublicProfileComponent;
  let fixture: ComponentFixture<PublicProfileComponent>;

  beforeEach(() => {
    const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    const mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    mockAuthService.isAuthenticated.and.returnValue(false);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    const mockActivatedRoute = {
      paramMap: of(convertToParamMap({})),
      snapshot: { paramMap: convertToParamMap({}) },
      queryParams: of({})
    };

    TestBed.configureTestingModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [PublicProfileComponent, RouterTestingModule],
    providers: [
        provideMockStore(),
        { provide: Actions, useValue: of() },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SnackBarService, useValue: mockSnackBarService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    fixture = TestBed.createComponent(PublicProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});

describe('PublicProfileComponent routing by numeric id vs username', () => {
  let store: MockStore;

  function setup(routeParam: string) {
    const mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    mockAuthService.isAuthenticated.and.returnValue(true);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    const mockActivatedRoute = {
      paramMap: of(convertToParamMap({ username: routeParam })),
      snapshot: { paramMap: convertToParamMap({ username: routeParam }) },
      queryParams: of({})
    };

    TestBed.configureTestingModule({
    schemas: [NO_ERRORS_SCHEMA],
    imports: [PublicProfileComponent, RouterTestingModule],
    providers: [
        provideMockStore(),
        { provide: Actions, useValue: of() },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SnackBarService, useValue: mockSnackBarService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();
    const fixture = TestBed.createComponent(PublicProfileComponent);
    fixture.detectChanges();
  }

  // Admin tables and the user-hover-card link here by numeric id (they don't
  // carry the target's username) -- a numeric route segment must resolve
  // through the by-id lookup, not a doomed by-username one.
  it('dispatches loadPublicProfile by id when the route segment is purely numeric', () => {
    setup('42');
    expect(store.dispatch).toHaveBeenCalledWith(loadPublicProfile({ id: 42 }));
  });

  it('dispatches loadPublicProfileByUsername when the route segment is a real username', () => {
    setup('alice');
    expect(store.dispatch).toHaveBeenCalledWith(loadPublicProfileByUsername({ username: 'alice' }));
  });
});

describe('PublicProfileComponent quickAdd (GN-59)', () => {
  let component: PublicProfileComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let authRedirectSpy: jasmine.SpyObj<AuthRedirectService>;
  let store: MockStore;

  function setup() {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'hasSession']);
    authRedirectSpy = jasmine.createSpyObj('AuthRedirectService', ['goToLogin']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    const mockActivatedRoute = {
      paramMap: of(convertToParamMap({})),
      snapshot: { paramMap: convertToParamMap({}) },
      queryParams: of({})
    };

    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [PublicProfileComponent, RouterTestingModule],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: of() },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AuthRedirectService, useValue: authRedirectSpy },
        { provide: SnackBarService, useValue: mockSnackBarService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();
    const fixture = TestBed.createComponent(PublicProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('sends a signed-out visitor to login instead of cloning the template', () => {
    setup();
    authServiceSpy.hasSession.and.returnValue(false);

    component.quickAdd({ id: 7 } as any);

    expect(authRedirectSpy.goToLogin).toHaveBeenCalled();
    expect(store.dispatch).not.toHaveBeenCalledWith(cloneWorkoutTemplate({ id: 7 }));
  });

  it('a device whose clock reads the access token as expired can still clone the template -- that is still a live session', () => {
    setup();
    authServiceSpy.hasSession.and.returnValue(true);
    authServiceSpy.isAuthenticated.and.returnValue(false);

    component.quickAdd({ id: 7 } as any);

    expect(authRedirectSpy.goToLogin).not.toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalledWith(cloneWorkoutTemplate({ id: 7 }));
  });
});
