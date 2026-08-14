import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterAnnouncementsComponent } from './center-announcements.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterService } from 'src/app/services/center.service';

describe('CenterAnnouncementsComponent', () => {
  let component: CenterAnnouncementsComponent;
  let fixture: ComponentFixture<CenterAnnouncementsComponent>;

  beforeEach(() => {
    const mockNgxUiLoaderService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const mockCenterService = jasmine.createSpyObj('CenterService', [
      'addAnnouncement',
      'updateAnnouncement',
      'updateAnnouncementStatus',
      'deleteAnnouncement'
    ]);
    mockCenterService.addAnnouncement.and.returnValue(of({}));
    mockCenterService.updateAnnouncement.and.returnValue(of({}));
    mockCenterService.updateAnnouncementStatus.and.returnValue(of({}));
    mockCenterService.deleteAnnouncement.and.returnValue(of({}));

    TestBed.configureTestingModule({
      declarations: [CenterAnnouncementsComponent],
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

    fixture = TestBed.createComponent(CenterAnnouncementsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
