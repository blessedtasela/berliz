import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { PublicProfileComponent } from './public-profile.component';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

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
