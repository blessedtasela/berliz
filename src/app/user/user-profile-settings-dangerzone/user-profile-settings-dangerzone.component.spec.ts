import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UserProfileSettingsDangerzoneComponent } from './user-profile-settings-dangerzone.component';

describe('UserProfileSettingsDangerzoneComponent', () => {
  let component: UserProfileSettingsDangerzoneComponent;
  let fixture: ComponentFixture<UserProfileSettingsDangerzoneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserProfileSettingsDangerzoneComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(UserProfileSettingsDangerzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits deleteAccount when the Delete account button is clicked', () => {
    let emitted = 0;
    component.deleteAccount.subscribe(() => emitted++);

    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    buttons.find(b => b.textContent?.includes('Delete account'))!.click();

    expect(emitted).toBe(1);
  });
});
