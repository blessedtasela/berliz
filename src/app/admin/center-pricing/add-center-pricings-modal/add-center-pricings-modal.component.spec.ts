import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { AddCenterPricingsModalComponent } from './add-center-pricings-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AddCenterPricingsModalComponent', () => {
  let component: AddCenterPricingsModalComponent;
  let fixture: ComponentFixture<AddCenterPricingsModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [AddCenterPricingsModalComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
    providers: [
        provideMockStore(),
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    fixture = TestBed.createComponent(AddCenterPricingsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
