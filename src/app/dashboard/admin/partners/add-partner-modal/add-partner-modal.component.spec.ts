import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPartnerModalComponent } from './add-partner-modal.component';

describe('AddPartnerModalComponent', () => {
  let component: AddPartnerModalComponent;
  let fixture: ComponentFixture<AddPartnerModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddPartnerModalComponent]
    });
    fixture = TestBed.createComponent(AddPartnerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
