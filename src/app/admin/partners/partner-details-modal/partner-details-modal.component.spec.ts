import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerDetailsModalComponent } from './partner-details-modal.component';

describe('PartnerDetailsModalComponent', () => {
  let component: PartnerDetailsModalComponent;
  let fixture: ComponentFixture<PartnerDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerDetailsModalComponent]
    });
    fixture = TestBed.createComponent(PartnerDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
