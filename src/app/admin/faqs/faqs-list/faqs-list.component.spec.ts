import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';

import { FaqsListComponent } from './faqs-list.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('FaqsListComponent', () => {
  let component: FaqsListComponent;
  let fixture: ComponentFixture<FaqsListComponent>;

  beforeEach(() => {
    const mockNgxService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [FaqsListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: mockNgxService },
        { provide: SnackBarService, useValue: mockSnackBarService },
        { provide: MatDialog, useValue: mockDialog },
      ]
    });

    fixture = TestBed.createComponent(FaqsListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
