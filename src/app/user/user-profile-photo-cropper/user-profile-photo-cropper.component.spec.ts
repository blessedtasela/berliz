import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UserProfilePhotoCropperComponent } from './user-profile-photo-cropper.component';

describe('UserProfilePhotoCropperComponent', () => {
  let component: UserProfilePhotoCropperComponent;
  let fixture: ComponentFixture<UserProfilePhotoCropperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfilePhotoCropperComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(UserProfilePhotoCropperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
