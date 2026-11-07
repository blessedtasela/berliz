import { Component, OnInit } from '@angular/core';
import { ProblemReport } from 'src/app/models/problem-report.model';
import { ProblemReportService } from 'src/app/services/problem-report.service';
import { genericError } from 'src/validators/form-validators.module';

const CATEGORY_LABELS: Record<string, string> = {
  PAYMENTS: 'Payments & billing',
  BOOKINGS: 'Bookings & sessions',
  ACCOUNT_AND_ACCESS: 'Account & access',
  SAFETY: 'Safety concern',
  TECHNICAL: 'Something is broken',
  CONTENT_AND_PROFILE: 'Content or a profile',
  OTHER: 'Something else',
  // Retired values, kept for reports filed before GN-32's taxonomy.
  bug: 'Something is broken',
  billing: 'Billing or subscription',
  'safety-concern': 'Safety concern',
  other: 'Something else'
};

/**
 * A signed-in reporter's own "Report a Problem" submissions (GN-32).
 * `GET /problemReport/mine` is already scoped to the caller -- no filtering
 * needed here, unlike the admin inbox which sees every report.
 */
@Component({
  selector: 'app-my-problem-reports',
  templateUrl: './my-problem-reports.component.html',
  styleUrls: ['./my-problem-reports.component.css'],
  standalone: false
})
export class MyProblemReportsComponent implements OnInit {

  reports: ProblemReport[] = [];
  loading = true;
  loadError = '';

  constructor(private problemReportService: ProblemReportService) { }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.loadError = '';
    this.problemReportService.getMyReports().subscribe({
      next: (reports) => {
        this.reports = reports || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = genericError;
      }
    });
  }

  categoryLabel(report: ProblemReport): string {
    return CATEGORY_LABELS[report.category] || report.category;
  }
}
