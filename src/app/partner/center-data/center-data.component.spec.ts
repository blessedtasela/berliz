import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { CenterDataComponent } from './center-data.component';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('CenterDataComponent', () => {
  let component: CenterDataComponent;
  let fixture: ComponentFixture<CenterDataComponent>;

  beforeEach(() => {
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const centerServiceSpy = jasmine.createSpyObj('CenterService', ['updateCenter']);
    const snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [CenterDataComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: CenterService, useValue: centerServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(CenterDataComponent);
    component = fixture.componentInstance;
    component.center = { id: 1, categoryIds: [], date: new Date().toISOString() } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
