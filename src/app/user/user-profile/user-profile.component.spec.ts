import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { provideMockStore } from '@ngrx/store/testing';

import { UserProfileComponent } from './user-profile.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(() => {
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [UserProfileComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy }
      ]
    });
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Regression: minLength was accidentally left at 900 (a stray "900" the display text
  // was updated away from without updating the actual validator to match), which made
  // the bio field impossible for any real user to satisfy.
  it('accepts a bio of 10+ characters and rejects anything shorter', () => {
    const bio = component.bioForm.get('bio');

    bio?.setValue('too short');
    expect(bio?.hasError('minlength')).toBeTrue();

    bio?.setValue('a'.repeat(10));
    expect(bio?.valid).toBeTrue();
  });
});
