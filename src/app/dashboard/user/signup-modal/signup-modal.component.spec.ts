import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupModalComponent } from './signup-modal.component';

describe('SignupModalComponent', () => {
  let component: SignupModalComponent;
  let fixture: ComponentFixture<SignupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SignupModalComponent]
    });
    fixture = TestBed.createComponent(SignupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
