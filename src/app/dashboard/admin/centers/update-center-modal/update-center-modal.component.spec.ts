import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCenterModalComponent } from './update-center-modal.component';

describe('UpdateCenterModalComponent', () => {
  let component: UpdateCenterModalComponent;
  let fixture: ComponentFixture<UpdateCenterModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateCenterModalComponent]
    });
    fixture = TestBed.createComponent(UpdateCenterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
