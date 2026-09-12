import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { BerlizFeedbackService } from 'src/app/services/berliz-feedback.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Platform-level "give feedback about Berliz" form — distinct from
 * trainer/center reviews (not tied to any specific entity). Requires the
 * submitter to be logged in; anonymous visitors get a login prompt instead,
 * same pattern as TrainerAddReviewComponent/CenterReviewFormComponent.
 */
@Component({
  selector: 'app-berliz-feedback-modal',
  templateUrl: './berliz-feedback-modal.component.html',
  styleUrls: ['./berliz-feedback-modal.component.css']
})
export class BerlizFeedbackModalComponent {
  feedbackForm: FormGroup;
  submitting = false;

  constructor(
    public dialogRef: MatDialogRef<BerlizFeedbackModalComponent>,
    private fb: FormBuilder,
    private authService: AuthService,
    private feedbackService: BerlizFeedbackService,
    private snackBar: SnackBarService,
    private router: Router,
  ) {
    this.feedbackForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  goToLogin(): void {
    this.dialogRef.close();
    this.router.navigate(['/login']);
  }

  submit(): void {
    if (this.feedbackForm.invalid || this.submitting) return;

    this.submitting = true;
    this.feedbackService.addFeedback(this.feedbackForm.value.message).subscribe({
      next: response => {
        this.submitting = false;
        this.snackBar.openSnackBar(response?.message || 'Thanks for your feedback!', '');
        this.dialogRef.close();
      },
      error: err => {
        this.submitting = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }
}
