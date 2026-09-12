import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterService } from 'src/app/services/center.service';
import { StrapiService } from 'src/app/services/strapi.service';

import { AddCenterModalComponent } from './add-center-modal.component';

describe('AddCenterModalComponent', () => {
  let component: AddCenterModalComponent;
  let fixture: ComponentFixture<AddCenterModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddCenterModalComponent],
      imports: [ReactiveFormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        { provide: CenterService, useValue: jasmine.createSpyObj('CenterService', ['addCenter']) },
        { provide: StrapiService, useValue: jasmine.createSpyObj('StrapiService', ['uploadToStrapi']) }
      ]
    });
    fixture = TestBed.createComponent(AddCenterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
