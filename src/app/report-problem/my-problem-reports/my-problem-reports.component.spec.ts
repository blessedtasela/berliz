import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, throwError } from 'rxjs';

import { MyProblemReportsComponent } from './my-problem-reports.component';
import { ProblemReportService } from 'src/app/services/problem-report.service';
import { ProblemReport } from 'src/app/models/problem-report.model';

function report(overrides: Partial<ProblemReport> = {}): ProblemReport {
  return {
    id: 1, userId: 5, name: 'Jane Doe', email: 'jane@example.com', category: 'TECHNICAL',
    description: 'Something broke', status: 'open', severity: 'STANDARD', referenceCode: 'PR-000001',
    autoClassified: true, mergeNotes: null, date: new Date(), lastUpdate: new Date(),
    ...overrides
  };
}

describe('MyProblemReportsComponent', () => {
  let component: MyProblemReportsComponent;
  let fixture: ComponentFixture<MyProblemReportsComponent>;
  let problemReportService: jasmine.SpyObj<ProblemReportService>;

  beforeEach(() => {
    const serviceSpy = jasmine.createSpyObj('ProblemReportService', ['getMyReports']);

    TestBed.configureTestingModule({
      declarations: [MyProblemReportsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: ProblemReportService, useValue: serviceSpy }
      ]
    });

    problemReportService = TestBed.inject(ProblemReportService) as jasmine.SpyObj<ProblemReportService>;
    fixture = TestBed.createComponent(MyProblemReportsComponent);
    component = fixture.componentInstance;
  });

  it('loads the reporter\'s own reports on init', () => {
    problemReportService.getMyReports.and.returnValue(of([report()]));

    fixture.detectChanges();

    expect(problemReportService.getMyReports).toHaveBeenCalled();
    expect(component.reports.length).toBe(1);
    expect(component.loading).toBeFalse();
  });

  it('surfaces a load error without throwing', () => {
    problemReportService.getMyReports.and.returnValue(throwError(() => new Error('fail')));

    fixture.detectChanges();

    expect(component.loading).toBeFalse();
    expect(component.loadError).toBeTruthy();
  });

  it('labels a GN-32 taxonomy category and a retired one', () => {
    expect(component.categoryLabel(report({ category: 'ACCOUNT_AND_ACCESS' }))).toBe('Account & access');
    expect(component.categoryLabel(report({ category: 'bug' }))).toBe('Something is broken');
    expect(component.categoryLabel(report({ category: 'UNKNOWN_FUTURE_VALUE' }))).toBe('UNKNOWN_FUTURE_VALUE');
  });
});
