import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterReviewComponent } from './center-review.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterService } from 'src/app/services/center.service';

describe('CenterReviewComponent', () => {
  let component: CenterReviewComponent;
  let fixture: ComponentFixture<CenterReviewComponent>;

  beforeEach(() => {
    const mockNgxUiLoaderService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    const mockCenterService = jasmine.createSpyObj('CenterService', ['updateReviewStatus']);
    mockCenterService.updateReviewStatus.and.returnValue(of({}));

    TestBed.configureTestingModule({
      declarations: [CenterReviewComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: NgxUiLoaderService, useValue: mockNgxUiLoaderService },
        { provide: SnackBarService, useValue: mockSnackBarService },
        { provide: CenterService, useValue: mockCenterService },
      ]
    });

    fixture = TestBed.createComponent(CenterReviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
