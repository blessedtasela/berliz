import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { EquipmentModalComponent } from './equipment-modal.component';
import { CenterService } from 'src/app/services/center.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('EquipmentModalComponent', () => {
  let component: EquipmentModalComponent;
  let fixture: ComponentFixture<EquipmentModalComponent>;

  beforeEach(() => {
    const centerServiceSpy = jasmine.createSpyObj('CenterService', ['getActiveCenters', 'updateEquipment', 'addEquipment']);
    centerServiceSpy.getActiveCenters.and.returnValue(of({ data: [] }));
    const trainerServiceSpy = jasmine.createSpyObj('TrainerService', ['getActiveTrainers']);
    trainerServiceSpy.getActiveTrainers.and.returnValue(of({ data: [] }));
    const strapiServiceSpy = jasmine.createSpyObj('StrapiService', ['uploadToStrapi']);
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, EquipmentModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CenterService, useValue: centerServiceSpy },
        { provide: TrainerService, useValue: trainerServiceSpy },
        { provide: StrapiService, useValue: strapiServiceSpy },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    });
    fixture = TestBed.createComponent(EquipmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
