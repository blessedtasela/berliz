import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { UpdateFaqModalComponent } from './update-faq-modal.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('UpdateFaqModalComponent', () => {
  let component: UpdateFaqModalComponent;
  let fixture: ComponentFixture<UpdateFaqModalComponent>;

  beforeEach(() => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const mockNgxService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const mockDialogData = {
      faqData: {
        id: 1,
        question: 'Sample question',
        answer: 'Sample answer',
        category: 'General',
        displayOrder: 0,
        status: 'true',
        date: new Date(),
        lastUpdate: new Date(),
      }
    };

    TestBed.configureTestingModule({
      declarations: [UpdateFaqModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: Actions, useValue: of() },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: NgxUiLoaderService, useValue: mockNgxService },
        { provide: SnackBarService, useValue: mockSnackBarService },
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      ]
    });

    fixture = TestBed.createComponent(UpdateFaqModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
