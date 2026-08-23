import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

import { AdminProblemReportsComponent } from './admin-problem-reports.component';
import { environment } from 'src/environments/environment';
import { ProblemReport } from 'src/app/models/problem-report.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('AdminProblemReportsComponent', () => {
  let component: AdminProblemReportsComponent;
  let fixture: ComponentFixture<AdminProblemReportsComponent>;
  let httpMock: HttpTestingController;

  const getUrl = environment.api + '/problemReport/get';

  const sampleReport: ProblemReport = {
    id: 1,
    userId: null,
    name: 'Jane Doe',
    email: 'jane@example.com',
    category: 'bug',
    description: 'The booking calendar does not load on Safari.',
    status: 'open',
    date: new Date(),
    lastUpdate: new Date()
  };

  beforeEach(() => {
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [AdminProblemReportsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule, MatDialogModule],
      providers: [
        DatePipe,
        { provide: SnackBarService, useValue: snackbarSpy }
      ]
    });
    fixture = TestBed.createComponent(AdminProblemReportsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and load reports on init', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(getUrl);
    expect(req.request.method).toBe('GET');
    req.flush([sampleReport]);

    expect(component).toBeTruthy();
    expect(component.reports.length).toBe(1);
    expect(component.reports[0].category).toBe('bug');
  });
});
