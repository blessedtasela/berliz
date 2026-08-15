import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UpdateTagModalComponent } from './update-tag-modal.component';
import { TagService } from 'src/app/services/tag.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('UpdateTagModalComponent', () => {
  let component: UpdateTagModalComponent;
  let fixture: ComponentFixture<UpdateTagModalComponent>;

  beforeEach(() => {
    const tagServiceSpy = jasmine.createSpyObj('TagService', ['updateTag']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackBarServiceSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      declarations: [UpdateTagModalComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        { provide: TagService, useValue: tagServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackBarServiceSpy },
        { provide: MAT_DIALOG_DATA, useValue: { tagData: {} } }
      ]
    });
    fixture = TestBed.createComponent(UpdateTagModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
