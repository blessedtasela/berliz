import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProblemReport } from 'src/app/models/problem-report.model';
import { ProblemReportService } from 'src/app/services/problem-report.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Admin inbox for "Report a Problem" submissions (/report-problem on the public
 * site). Kept as a plain HttpClient-backed component rather than going through
 * an NgRx store — this is a new, small admin surface and the existing
 * ContactUs admin module's full store/effects/realtime-STOMP setup would be a
 * lot of additional surface area for a first cut; see project_ngrx_migration
 * memory, which already documents several admin lists that stay on direct
 * service calls. Category/status act as the triage signal (see
 * ProblemReportServiceImplement on the backend for the valid category set).
 */
@Component({
  selector: 'app-admin-problem-reports',
  templateUrl: './admin-problem-reports.component.html',
  styleUrls: ['./admin-problem-reports.component.css']
})
export class AdminProblemReportsComponent implements OnInit {

  reports: ProblemReport[] = [];
  loading = false;
  responseMessage = '';

  constructor(
    private problemReportService: ProblemReportService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private snackbarService: SnackBarService
  ) { }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    this.problemReportService.getAllProblemReports().subscribe({
      next: (reports) => {
        this.reports = reports || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackbarService.openSnackBar(genericError, 'error');
      }
    });
  }

  toggleStatus(report: ProblemReport): void {
    const dialogConfig = new MatDialogConfig();
    const goingTo = report.status === 'open' ? 'resolved' : 'open';
    dialogConfig.data = {
      message: `Mark this report as ${goingTo}?`,
      confirmation: true
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.problemReportService.updateStatus(report.id).subscribe({
        next: (response: any) => {
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close();
          this.loadReports();
        },
        error: (error: any) => {
          this.responseMessage = error?.error?.message || genericError;
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        }
      });
    });
  }

  deleteReport(report: ProblemReport): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'Delete this problem report? This is irreversible.',
      confirmation: true
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.problemReportService.deleteProblemReport(report.id).subscribe({
        next: (response: any) => {
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close();
          this.loadReports();
        },
        error: (error: any) => {
          this.responseMessage = error?.error?.message || genericError;
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        }
      });
    });
  }

  formatDate(dateString: any): any {
    return this.datePipe.transform(new Date(dateString), 'dd/MM/yyyy');
  }

  trackByReport(_: number, report: ProblemReport): number {
    return report.id;
  }
}
