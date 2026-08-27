import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { UserProfileSettingsFormComponent } from './user-profile-settings-form.component';

describe('UserProfileSettingsFormComponent', () => {
  let component: UserProfileSettingsFormComponent;
  let fixture: ComponentFixture<UserProfileSettingsFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfileSettingsFormComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(UserProfileSettingsFormComponent);
    component = fixture.componentInstance;
    component.form = new FormBuilder().group({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
