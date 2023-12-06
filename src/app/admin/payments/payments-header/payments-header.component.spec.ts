import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsHeaderComponent } from './payments-header.component';

describe('PaymentsHeaderComponent', () => {
  let component: PaymentsHeaderComponent;
  let fixture: ComponentFixture<PaymentsHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentsHeaderComponent]
    });
    fixture = TestBed.createComponent(PaymentsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
