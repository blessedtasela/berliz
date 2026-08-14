import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterTrainersComponent } from './center-trainers.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterService } from 'src/app/services/center.service';

describe('CenterTrainersComponent', () => {
  let component: CenterTrainersComponent;
  let fixture: ComponentFixture<CenterTrainersComponent>;

  beforeEach(() => {
    const mockNgxUiLoaderService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    const mockCenterService = jasmine.createSpyObj('CenterService', [
      'addCenterTrainer', 'updateCenterTrainerStatus', 'deleteCenterTrainer'
    ]);
    mockCenterService.addCenterTrainer.and.returnValue(of({}));
    mockCenterService.updateCenterTrainerStatus.and.returnValue(of({}));
    mockCenterService.deleteCenterTrainer.and.returnValue(of({}));

    TestBed.configureTestingModule({
      declarations: [CenterTrainersComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: mockNgxUiLoaderService },
        { provide: SnackBarService, useValue: mockSnackBarService },
        { provide: CenterService, useValue: mockCenterService },
      ]
    });

    fixture = TestBed.createComponent(CenterTrainersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
