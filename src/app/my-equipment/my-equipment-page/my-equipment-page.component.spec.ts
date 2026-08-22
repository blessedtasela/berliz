import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { MyEquipmentPageComponent } from './my-equipment-page.component';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('MyEquipmentPageComponent', () => {
  let component: MyEquipmentPageComponent;
  let fixture: ComponentFixture<MyEquipmentPageComponent>;

  beforeEach(() => {
    const centerServiceSpy = jasmine.createSpyObj('CenterService', ['getMyEquipment', 'updateEquipmentFeatured']);
    centerServiceSpy.getMyEquipment.and.returnValue(of({ data: [] }));
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule, MyEquipmentPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: CenterService, useValue: centerServiceSpy },
        { provide: SnackBarService, useValue: snackBarSpy }
      ]
    });
    fixture = TestBed.createComponent(MyEquipmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
