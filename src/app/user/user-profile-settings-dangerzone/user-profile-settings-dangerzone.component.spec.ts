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

  it('has a Delete account button that emits deleteAccount -- separate from Deactivate', () => {
    const deleted = jasmine.createSpy('deleteAccount');
    const deactivated = jasmine.createSpy('deactivate');
    component.deleteAccount.subscribe(deleted);
    component.deactivate.subscribe(deactivated);

    const button = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .find(b => b.textContent?.includes('Delete account'));
    expect(button).withContext('the Delete account button').toBeTruthy();
    button!.click();

    expect(deleted).toHaveBeenCalledTimes(1);
    expect(deactivated).not.toHaveBeenCalled();
  });
});
