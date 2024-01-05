import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterPricingsDetailsModalComponent } from './center-pricings-details-modal.component';

describe('CenterPricingsDetailsModalComponent', () => {
  let component: CenterPricingsDetailsModalComponent;
  let fixture: ComponentFixture<CenterPricingsDetailsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterPricingsDetailsModalComponent]
    });
    fixture = TestBed.createComponent(CenterPricingsDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
