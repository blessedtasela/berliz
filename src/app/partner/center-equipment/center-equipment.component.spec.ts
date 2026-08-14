import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterEquipmentComponent } from './center-equipment.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterService } from 'src/app/services/center.service';

describe('CenterEquipmentComponent', () => {
  let component: CenterEquipmentComponent;
  let fixture: ComponentFixture<CenterEquipmentComponent>;

  beforeEach(() => {
    const mockNgxUiLoaderService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const mockCenterService = jasmine.createSpyObj('CenterService', [
      'addEquipment',
      'updateEquipment',
      'deleteEquipment'
    ]);
    mockCenterService.addEquipment.and.returnValue(of({}));
    mockCenterService.updateEquipment.and.returnValue(of({}));
    mockCenterService.deleteEquipment.and.returnValue(of({}));

    TestBed.configureTestingModule({
      declarations: [CenterEquipmentComponent],
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

    fixture = TestBed.createComponent(CenterEquipmentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
