import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCenterPricingsModalComponent } from './update-center-pricings-modal.component';

describe('UpdateCenterPricingsModalComponent', () => {
  let component: UpdateCenterPricingsModalComponent;
  let fixture: ComponentFixture<UpdateCenterPricingsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateCenterPricingsModalComponent]
    });
    fixture = TestBed.createComponent(UpdateCenterPricingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
