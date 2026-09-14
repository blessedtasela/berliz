import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { UpdateMembersModalComponent } from './update-members-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('UpdateMembersModalComponent', () => {
  let component: UpdateMembersModalComponent;
  let fixture: ComponentFixture<UpdateMembersModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateMembersModalComponent],
      imports: [HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            memberData: {
              height: 170, weight: 70, targetWeight: 65,
              motivation: 'Get fit and healthy', medicalConditions: '', categories: []
            }
          }
        },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) }
      ]
    });
    fixture = TestBed.createComponent(UpdateMembersModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
