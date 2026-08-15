import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of } from 'rxjs';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { PartnerDataComponent } from './partner-data.component';

describe('PartnerDataComponent', () => {
  let component: PartnerDataComponent;
  let fixture: ComponentFixture<PartnerDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerDataComponent],
      imports: [ReactiveFormsModule],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        { provide: PartnerService, useValue: jasmine.createSpyObj('PartnerService', ['updateFile'], { updateFile: () => of({}) }) },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(PartnerDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
