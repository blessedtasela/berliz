import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCenterPricingsModalComponent } from './add-center-pricings-modal.component';

describe('AddCenterPricingsModalComponent', () => {
  let component: AddCenterPricingsModalComponent;
  let fixture: ComponentFixture<AddCenterPricingsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCenterPricingsModalComponent]
    });
    fixture = TestBed.createComponent(AddCenterPricingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
