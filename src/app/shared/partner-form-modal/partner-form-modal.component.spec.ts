import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerFormModalComponent } from './partner-form-modal.component';

describe('PartnerFormModalComponent', () => {
  let component: PartnerFormModalComponent;
  let fixture: ComponentFixture<PartnerFormModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerFormModalComponent]
    });
    fixture = TestBed.createComponent(PartnerFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
