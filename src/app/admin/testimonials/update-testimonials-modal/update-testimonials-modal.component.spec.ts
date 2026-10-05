import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UpdateTestimonialsModalComponent } from './update-testimonials-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('UpdateTestimonialsModalComponent', () => {
  let component: UpdateTestimonialsModalComponent;
  let fixture: ComponentFixture<UpdateTestimonialsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [UpdateTestimonialsModalComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
    providers: [
        provideMockStore(),
        {
            provide: MAT_DIALOG_DATA,
            useValue: { testimonialData: { testimonial: 'Great service', centerId: null, trainerId: null } }
        },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(UpdateTestimonialsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
