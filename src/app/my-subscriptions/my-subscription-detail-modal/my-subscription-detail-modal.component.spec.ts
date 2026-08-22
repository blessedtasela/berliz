import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MySubscriptionDetailModalComponent } from './my-subscription-detail-modal.component';

describe('MySubscriptionDetailModalComponent', () => {
  let component: MySubscriptionDetailModalComponent;
  let fixture: ComponentFixture<MySubscriptionDetailModalComponent>;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [MySubscriptionDetailModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { subscription: {} } }
      ]
    });
    fixture = TestBed.createComponent(MySubscriptionDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
