import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of } from 'rxjs';

import { EquipmentPageComponent } from './equipment-page.component';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('EquipmentPageComponent', () => {
  let component: EquipmentPageComponent;
  let fixture: ComponentFixture<EquipmentPageComponent>;

  beforeEach(() => {
    const centerServiceSpy = jasmine.createSpyObj('CenterService', ['getAllEquipment', 'updateEquipmentFeatured', 'deleteEquipment']);
    centerServiceSpy.getAllEquipment.and.returnValue(of({ data: [] }));
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const loaderSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);

    TestBed.configureTestingModule({
      imports: [FormsModule, EquipmentPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CenterService, useValue: centerServiceSpy },
        { provide: SnackBarService, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: NgxUiLoaderService, useValue: loaderSpy }
      ]
    });
    fixture = TestBed.createComponent(EquipmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
