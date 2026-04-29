import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileSettingsComponent } from './user-profile-settings.component';

describe('UserProfileSettingsComponent', () => {
  let component: UserProfileSettingsComponent;
  let fixture: ComponentFixture<UserProfileSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfileSettingsComponent]
    });
    fixture = TestBed.createComponent(UserProfileSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
