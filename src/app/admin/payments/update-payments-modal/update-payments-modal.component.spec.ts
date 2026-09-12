import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UpdatePaymentsModalComponent } from './update-payments-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('UpdatePaymentsModalComponent', () => {
  let component: UpdatePaymentsModalComponent;
  let fixture: ComponentFixture<UpdatePaymentsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdatePaymentsModalComponent],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { paymentData: { paymentMethod: 'card', amount: 10 } } },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) }
      ]
    });
    fixture = TestBed.createComponent(UpdatePaymentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
