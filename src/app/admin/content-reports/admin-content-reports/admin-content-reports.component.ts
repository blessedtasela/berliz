import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ContentReportResponse } from 'src/app/models/content-report.model';
import { ContentReportService } from 'src/app/services/content-report.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

type StatusFilter = 'pending' | 'resolved' | 'dismissed';

/**
 * Admin triage inbox for reported posts/comments -- mirrors
 * AdminProblemReportsComponent's own pattern (plain HttpClient-backed, no
 * NgRx store, see that component's comment for why a first-cut admin list
 * stays this simple). Defaults to "pending" since that's the actionable
 * queue; resolved/dismissed are there for the audit trail.
 */
@Component({
  selector: 'app-admin-content-reports',
  templateUrl: './admin-content-reports.component.html',
  styleUrls: ['./admin-content-reports.component.css']
})
export class AdminContentReportsComponent implements OnInit {

  reports: ContentReportResponse[] = [];
  loading = false;
  statusFilter: StatusFilter = 'pending';

  constructor(
    private contentReportService: ContentReportService,
    private datePipe: DatePipe,
    private snackBarService: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.contentReportService.getReports(this.statusFilter).subscribe({
      next: res => {
        this.loading = false;
        this.reports = res.data ?? [];
      },
      error: () => {
        this.loading = false;
        this.snackBarService.openSnackBar(genericError, 'error');
      },
    });
  }

  selectFilter(filter: StatusFilter): void {
    if (filter === this.statusFilter) return;
    this.statusFilter = filter;
    this.loadReports();
  }

  resolve(report: ContentReportResponse): void {
    this.setStatus(report, 'resolved');
  }

  dismiss(report: ContentReportResponse): void {
    this.setStatus(report, 'dismissed');
  }

  private setStatus(report: ContentReportResponse, status: 'resolved' | 'dismissed'): void {
    this.contentReportService.updateStatus(report.id, status).subscribe({
      next: res => {
        this.snackBarService.openSnackBar(res.data?.message || `Report ${status}`, '');
        this.reports = this.reports.filter(r => r.id !== report.id);
      },
      error: err => this.snackBarService.openSnackBar(err.error?.message || genericError, 'error'),
    });
  }

  formatDate(dateString: string): string | null {
    return this.datePipe.transform(new Date(dateString), 'dd/MM/yyyy HH:mm');
  }

  trackByReport(_: number, report: ContentReportResponse): number {
    return report.id;
  }
}
