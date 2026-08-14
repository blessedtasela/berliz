import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';

import { TrainerFormModalComponent } from './trainer-form-modal.component';

describe('TrainerFormModalComponent', () => {
  let component: TrainerFormModalComponent;
  let fixture: ComponentFixture<TrainerFormModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerFormModalComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: MAT_DIALOG_DATA, useValue: { partnerData: {} } },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        { provide: TrainerService, useValue: jasmine.createSpyObj('TrainerService', ['addTrainer']) },
      ]
    });
    fixture = TestBed.createComponent(TrainerFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
