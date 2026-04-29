import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileSettingsFormComponent } from './user-profile-settings-form.component';

describe('UserProfileSettingsFormComponent', () => {
  let component: UserProfileSettingsFormComponent;
  let fixture: ComponentFixture<UserProfileSettingsFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfileSettingsFormComponent]
    });
    fixture = TestBed.createComponent(UserProfileSettingsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
