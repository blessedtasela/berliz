import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { PartnerDetailPageComponent } from './partner-detail-page.component';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectPartners } from 'src/app/state/partner/partner.selectors';

describe('PartnerDetailPageComponent', () => {
  let component: PartnerDetailPageComponent;
  let fixture: ComponentFixture<PartnerDetailPageComponent>;

  beforeEach(() => {
    const partnerServiceSpy = jasmine.createSpyObj('PartnerService', ['rejectApplication']);
    const ngxServiceSpy = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      declarations: [PartnerDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectPartners, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: PartnerService, useValue: partnerServiceSpy },
        { provide: NgxUiLoaderService, useValue: ngxServiceSpy },
        { provide: SnackBarService, useValue: snackBarSpy }
      ]
    });

    fixture = TestBed.createComponent(PartnerDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
