import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { TrainerPricingDetailsModalComponent } from './trainer-pricing-details-modal.component';

describe('TrainerPricingDetailsModalComponent', () => {
  let component: TrainerPricingDetailsModalComponent;
  let fixture: ComponentFixture<TrainerPricingDetailsModalComponent>;

  beforeEach(() => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [TrainerPricingDetailsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { trainerPricingData: { date: new Date().toISOString(), lastUpdate: new Date().toISOString() } } }
      ]
    });
    fixture = TestBed.createComponent(TrainerPricingDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
