import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UserAccountInfoComponent } from './user-account-info.component';

describe('UserAccountInfoComponent', () => {
  let component: UserAccountInfoComponent;
  let fixture: ComponentFixture<UserAccountInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserAccountInfoComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(UserAccountInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
