import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePaymentsModalComponent } from './update-payments-modal.component';

describe('UpdatePaymentsModalComponent', () => {
  let component: UpdatePaymentsModalComponent;
  let fixture: ComponentFixture<UpdatePaymentsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdatePaymentsModalComponent]
    });
    fixture = TestBed.createComponent(UpdatePaymentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
