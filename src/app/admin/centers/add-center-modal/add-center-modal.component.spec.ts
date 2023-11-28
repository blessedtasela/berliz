import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCenterModalComponent } from './add-center-modal.component';

describe('AddCenterModalComponent', () => {
  let component: AddCenterModalComponent;
  let fixture: ComponentFixture<AddCenterModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCenterModalComponent]
    });
    fixture = TestBed.createComponent(AddCenterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
