import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBioEditComponent } from './user-bio-edit.component';

describe('UserBioEditComponent', () => {
  let component: UserBioEditComponent;
  let fixture: ComponentFixture<UserBioEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserBioEditComponent]
    });
    fixture = TestBed.createComponent(UserBioEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
