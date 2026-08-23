import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { UserBioEditComponent } from './user-bio-edit.component';

describe('UserBioEditComponent', () => {
  let component: UserBioEditComponent;
  let fixture: ComponentFixture<UserBioEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserBioEditComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(UserBioEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
