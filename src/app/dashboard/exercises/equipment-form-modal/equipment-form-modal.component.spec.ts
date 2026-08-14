import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { EquipmentFormModalComponent } from './equipment-form-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('EquipmentFormModalComponent', () => {
  let component: EquipmentFormModalComponent;
  let fixture: ComponentFixture<EquipmentFormModalComponent>;

  beforeEach(() => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      imports: [EquipmentFormModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'add', categories: [] } },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: SnackBarService, useValue: mockSnackBarService },
      ]
    });

    fixture = TestBed.createComponent(EquipmentFormModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
