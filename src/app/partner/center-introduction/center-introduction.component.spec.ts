import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterIntroductionComponent } from './center-introduction.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterService } from 'src/app/services/center.service';

describe('CenterIntroductionComponent', () => {
  let component: CenterIntroductionComponent;
  let fixture: ComponentFixture<CenterIntroductionComponent>;

  beforeEach(() => {
    const mockNgxUiLoaderService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const mockCenterService = jasmine.createSpyObj('CenterService', [
      'addIntroduction',
      'updateIntroduction'
    ]);
    mockCenterService.addIntroduction.and.returnValue(of({}));
    mockCenterService.updateIntroduction.and.returnValue(of({}));

    TestBed.configureTestingModule({
      declarations: [CenterIntroductionComponent],
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

    fixture = TestBed.createComponent(CenterIntroductionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
