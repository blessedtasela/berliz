import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailsModalComponent } from './user-details-modal.component';

describe('UserDetailsModalComponent', () => {
  let component: UserDetailsModalComponent;
  let fixture: ComponentFixture<UserDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserDetailsModalComponent]
    });
    fixture = TestBed.createComponent(UserDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
