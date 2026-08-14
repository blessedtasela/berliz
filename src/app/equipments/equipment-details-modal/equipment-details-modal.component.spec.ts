import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { EquipmentDetailsModalComponent } from './equipment-details-modal.component';

describe('EquipmentDetailsModalComponent', () => {
  let component: EquipmentDetailsModalComponent;
  let fixture: ComponentFixture<EquipmentDetailsModalComponent>;

  beforeEach(() => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [EquipmentDetailsModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { equipment: {}, categoryNames: [] } },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ]
    });

    fixture = TestBed.createComponent(EquipmentDetailsModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
