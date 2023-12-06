import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPaymentsModalComponent } from './add-payments-modal.component';

describe('AddPaymentsModalComponent', () => {
  let component: AddPaymentsModalComponent;
  let fixture: ComponentFixture<AddPaymentsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPaymentsModalComponent]
    });
    fixture = TestBed.createComponent(AddPaymentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
