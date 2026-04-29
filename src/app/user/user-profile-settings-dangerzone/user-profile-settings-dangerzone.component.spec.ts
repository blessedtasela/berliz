import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileSettingsDangerzoneComponent } from './user-profile-settings-dangerzone.component';

describe('UserProfileSettingsDangerzoneComponent', () => {
  let component: UserProfileSettingsDangerzoneComponent;
  let fixture: ComponentFixture<UserProfileSettingsDangerzoneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfileSettingsDangerzoneComponent]
    });
    fixture = TestBed.createComponent(UserProfileSettingsDangerzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
