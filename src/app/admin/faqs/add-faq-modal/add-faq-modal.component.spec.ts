import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { AddFaqModalComponent } from './add-faq-modal.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('AddFaqModalComponent', () => {
  let component: AddFaqModalComponent;
  let fixture: ComponentFixture<AddFaqModalComponent>;

  beforeEach(() => {
    const mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    const mockNgxService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [AddFaqModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        provideMockStore(),
        { provide: Actions, useValue: of() },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: NgxUiLoaderService, useValue: mockNgxService },
        { provide: SnackBarService, useValue: mockSnackBarService },
      ]
    });

    fixture = TestBed.createComponent(AddFaqModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
