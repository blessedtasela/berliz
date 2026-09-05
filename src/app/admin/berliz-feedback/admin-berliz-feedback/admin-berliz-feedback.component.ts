import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BerlizFeedback, BerlizFeedbackService } from 'src/app/services/berliz-feedback.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Admin inbox for platform-level feedback (the footer "Give Feedback" modal)
 * — distinct from trainer/center reviews and from Problem Reports. Kept as
 * a plain HttpClient-backed component rather than an NgRx store, same
 * reasoning as AdminProblemReportsComponent: a small, new admin surface.
 * Read-only for now — there's no update/delete endpoint on the backend yet.
 */
@Component({
  selector: 'app-admin-berliz-feedback',
  templateUrl: './admin-berliz-feedback.component.html',
  styleUrls: ['./admin-berliz-feedback.component.css']
})
export class AdminBerlizFeedbackComponent implements OnInit {

  feedbackList: BerlizFeedback[] = [];
  loading = false;

  constructor(
    private feedbackService: BerlizFeedbackService,
    private datePipe: DatePipe,
    private snackbarService: SnackBarService
  ) { }

  ngOnInit(): void {
    this.loadFeedback();
  }

  loadFeedback(): void {
    this.loading = true;
    this.feedbackService.getAllFeedback().subscribe({
      next: response => {
        this.feedbackList = response?.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackbarService.openSnackBar(genericError, 'error');
      }
    });
  }

  formatDate(dateString: any): any {
    return this.datePipe.transform(new Date(dateString), 'dd/MM/yyyy');
  }

  trackByFeedback(_: number, feedback: BerlizFeedback): number {
    return feedback.id;
  }
}
