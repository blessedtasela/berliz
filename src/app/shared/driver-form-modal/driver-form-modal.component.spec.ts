import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverFormModalComponent } from './driver-form-modal.component';

describe('DriverFormModalComponent', () => {
  let component: DriverFormModalComponent;
  let fixture: ComponentFixture<DriverFormModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DriverFormModalComponent]
    });
    fixture = TestBed.createComponent(DriverFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
