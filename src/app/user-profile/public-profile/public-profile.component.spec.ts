import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Actions } from '@ngrx/effects';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { PublicProfileComponent } from './public-profile.component';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadPublicProfile, loadPublicProfileByUsername } from 'src/app/state/user-profile/user-profile.actions';

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
      imports: [PublicProfileComponent, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: of() },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SnackBarService, useValue: mockSnackBarService },
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
      imports: [PublicProfileComponent, RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: of() },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: AuthService, useValue: mockAuthService },
        { provide: SnackBarService, useValue: mockSnackBarService },
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
